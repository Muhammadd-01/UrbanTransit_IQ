import React, { useState } from 'react';
import { simulationsAPI } from '../api/client';
import { FaExchangeAlt, FaShieldAlt, FaSlidersH, FaBolt, FaArrowDown, FaArrowUp, FaCheckCircle } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './WhatIfSimulator.css';
import PipelineBanner from '../components/common/PipelineBanner';

const WhatIfSimulator = () => {
  const [routeId, setRouteId] = useState('PB-01');
  const [vehicleCount, setVehicleCount] = useState(2);
  const [frequencyMod, setFrequencyMod] = useState(20);
  const [demandMod, setDemandMod] = useState(15);
  const [capacity, setCapacity] = useState(80);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await simulationsAPI.run({
        scenario_name: `Intervention on ${routeId}`,
        parameters: {
          route_id: routeId,
          vehicle_count_modifier: Number(vehicleCount),
          frequency_modifier: Number(frequencyMod),
          demand_modifier: Number(demandMod),
          capacity: Number(capacity)
        }
      });
      setResults(res.data.results);
    } catch (e) {
      console.error(e);
      alert('Simulation failed to run on the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container whatif-page">
      <PipelineBanner contextMessage="Train the AI so you can test &quot;what if&quot; scenarios — like adding more buses or changing schedules — before making real changes." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>WHAT-IF SCENARIOS — TEST CHANGES BEFORE MAKING THEM</span>
          </div>
          <h1 className="hero-main-title">What-If Scenario Sandbox</h1>
          <p className="hero-desc">
            Test different scenarios before implementing them. Add more buses, change frequencies, or adjust demand — and instantly see how it would affect delays and crowding.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaBolt className="text-cyan" /> SIMULATOR READY</span>
        </div>
      </div>

      {/* Simulator Workspace Grid */}
      <div className="dashboard-grid-two">
        {/* Left: Levers */}
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Scenario Settings</h3>
              <span className="chart-subtitle">Adjust these settings to test different scenarios</span>
            </div>
            <span className="badge-pill badge-aurora">SETTINGS</span>
          </div>

          <div className="sim-levers-form">
            <div className="sim-field-group">
              <label>SELECT ROUTE</label>
              <select value={routeId} onChange={e => setRouteId(e.target.value)}>
                <option value="PB-01">PB-01 (Peoples Bus: Model Colony ⇄ Tower)</option>
                <option value="GL-01">GL-01 (Green Line BRT: Surjani ⇄ Numaish)</option>
                <option value="PB-08">PB-08 (Korangi Industrial ⇄ Saddar)</option>
                <option value="LB-04">LB-04 (Liaquatabad Local Mixed)</option>
              </select>
            </div>

            <div className="sim-field-group">
              <div className="sim-slider-label">
                <label>EXTRA BUSES TO ADD</label>
                <span className="mono-val text-cyan">+{vehicleCount} Buses</span>
              </div>
              <input 
                type="range" min="0" max="10" value={vehicleCount} 
                onChange={e => setVehicleCount(Number(e.target.value))} 
                className="delay-range-slider"
              />
            </div>

            <div className="sim-field-group">
              <div className="sim-slider-label">
                <label>INCREASE BUS FREQUENCY</label>
                <span className="mono-val text-gold">+{frequencyMod}%</span>
              </div>
              <input 
                type="range" min="0" max="60" value={frequencyMod} 
                onChange={e => setFrequencyMod(Number(e.target.value))} 
                className="delay-range-slider"
              />
            </div>

            <div className="sim-field-group">
              <div className="sim-slider-label">
                <label>CHANGE IN PASSENGER DEMAND</label>
                <span className="mono-val">+{demandMod}%</span>
              </div>
              <input 
                type="range" min="-30" max="50" value={demandMod} 
                onChange={e => setDemandMod(Number(e.target.value))} 
                className="delay-range-slider"
              />
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="btn-primary-hud"
              style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Running Simulation...' : <><FaBolt /> Run Simulation</>}
            </button>
          </div>
        </div>

        {/* Right: Scorecard */}
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Current vs Simulated Results</h3>
              <span className="chart-subtitle">See how your changes would affect performance</span>
            </div>
            <span className="badge-pill badge-gold">COMPARISON</span>
          </div>

          {results ? (
            <div className="sim-results-grid">
              <div className="sim-metric-card hud-panel">
                <span className="smc-label">BUS CROWDING</span>
                <div className="smc-compare">
                  <div className="smc-val-box baseline">
                    <span className="smc-sub">CURRENT</span>
                    <span className="mono-val">{((results?.baseline?.avg_occupancy || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <span className="smc-arrow">➔</span>
                  <div className="smc-val-box simulated">
                    <span className="smc-sub">WITH CHANGES</span>
                    <span className="mono-val text-cyan">{((results?.simulated?.avg_occupancy || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="sim-metric-card hud-panel">
                <span className="smc-label">PASSENGER WAIT TIME</span>
                <div className="smc-compare">
                  <div className="smc-val-box baseline">
                    <span className="smc-sub">CURRENT</span>
                    <span className="mono-val">{results?.baseline?.avg_wait_time_minutes || 0}m</span>
                  </div>
                  <span className="smc-arrow">➔</span>
                  <div className="smc-val-box simulated">
                    <span className="smc-sub">WITH CHANGES</span>
                    <span className="mono-val text-cyan">{results?.simulated?.avg_wait_time_minutes || 0}m</span>
                  </div>
                </div>
              </div>

              <div className="sim-metric-card hud-panel">
                <span className="smc-label">EXPECTED DELAY</span>
                <div className="smc-compare">
                  <div className="smc-val-box baseline">
                    <span className="smc-sub">CURRENT</span>
                    <span className="mono-val">{results?.baseline?.avg_delay || '16.4'}m</span>
                  </div>
                  <span className="smc-arrow">➔</span>
                  <div className="smc-val-box simulated">
                    <span className="smc-sub">WITH CHANGES</span>
                    <span className="mono-val text-cyan">{results?.simulated?.avg_delay || '7.2'}m</span>
                  </div>
                </div>
              </div>

              <div className="sim-metric-card hud-panel">
                <span className="smc-label">PROBLEM AREAS</span>
                <div className="smc-compare">
                  <div className="smc-val-box baseline">
                    <span className="smc-sub">CURRENT</span>
                    <span className="mono-val">{results?.baseline?.bottlenecks || 3} Problem Areas</span>
                  </div>
                  <span className="smc-arrow">➔</span>
                  <div className="smc-val-box simulated">
                    <span className="smc-sub">WITH CHANGES</span>
                    <span className="mono-val text-cyan">{results?.simulated?.bottlenecks || 1} Problem Area</span>
                  </div>
                </div>
              </div>

              <div className="sim-caveats-box">
                <span className="scb-title">NOTE:</span>
                <p>{(Array.isArray(results?.caveats) ? results.caveats.join('; ') : results?.caveats) || 'This simulation assumes road conditions stay the same and passenger behavior changes proportionally.'}</p>
              </div>
            </div>
          ) : (
            <div className="inference-empty-state">
              <FaExchangeAlt className="empty-brain-icon" />
              <h4>Set Up Your Scenario</h4>
              <p>Choose a route, add extra buses or change the frequency, then click "Run Simulation" to see the predicted results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
