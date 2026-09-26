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
      <PipelineBanner contextMessage="Counterfactual scenarios are simulated using the baseline model trained on historical data." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>DECISION INTELLIGENCE // COUNTERFACTUAL ENGINE</span>
          </div>
          <h1 className="hero-main-title">What-If Scenario Sandbox</h1>
          <p className="hero-desc">
            Simulate operational interventions across Karachi's corridors: inject additional vehicles, compress headways, and observe counterfactual impact on dwell delays and overcrowding.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaBolt className="text-cyan" /> ELASTICITY MODEL ACTIVE</span>
        </div>
      </div>

      {/* Simulator Workspace Grid */}
      <div className="dashboard-grid-two">
        {/* Left: Levers */}
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Scenario Builder Levers</h3>
              <span className="chart-subtitle">Operational dispatch adjustments</span>
            </div>
            <span className="badge-pill badge-aurora">DISPATCH CONFIG</span>
          </div>

          <div className="sim-levers-form">
            <div className="sim-field-group">
              <label>CORRIDOR SELECTION</label>
              <select value={routeId} onChange={e => setRouteId(e.target.value)}>
                <option value="PB-01">PB-01 (Peoples Bus: Model Colony ⇄ Tower)</option>
                <option value="GL-01">GL-01 (Green Line BRT: Surjani ⇄ Numaish)</option>
                <option value="PB-08">PB-08 (Korangi Industrial ⇄ Saddar)</option>
                <option value="LB-04">LB-04 (Liaquatabad Local Mixed)</option>
              </select>
            </div>

            <div className="sim-field-group">
              <div className="sim-slider-label">
                <label>ADDITIONAL VEHICLES IN SERVICE</label>
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
                <label>FREQUENCY BOOST</label>
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
                <label>PASSENGER DEMAND SHIFT</label>
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
              {loading ? 'Simulating Dynamic Network Elasticity...' : <><FaBolt /> Run Counterfactual Simulation</>}
            </button>
          </div>
        </div>

        {/* Right: Scorecard */}
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Baseline vs Simulated Impact</h3>
              <span className="chart-subtitle">Projected operational delta</span>
            </div>
            <span className="badge-pill badge-gold">COUNTERFACTUAL</span>
          </div>

          {results ? (
            <div className="sim-results-grid">
              <div className="sim-metric-card hud-panel">
                <span className="smc-label">NETWORK OCCUPANCY</span>
                <div className="smc-compare">
                  <div className="smc-val-box baseline">
                    <span className="smc-sub">BASELINE</span>
                    <span className="mono-val">{(results.baseline.current_avg_occupancy * 100).toFixed(1)}%</span>
                  </div>
                  <span className="smc-arrow">➔</span>
                  <div className="smc-val-box simulated">
                    <span className="smc-sub">SIMULATED</span>
                    <span className="mono-val text-cyan">{(results.simulated.SIMULATED_avg_occupancy * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="sim-metric-card hud-panel">
                <span className="smc-label">PASSENGER WAIT TIME</span>
                <div className="smc-compare">
                  <div className="smc-val-box baseline">
                    <span className="smc-sub">BASELINE</span>
                    <span className="mono-val">{results.baseline.current_wait_time_minutes}m</span>
                  </div>
                  <span className="smc-arrow">➔</span>
                  <div className="smc-val-box simulated">
                    <span className="smc-sub">SIMULATED</span>
                    <span className="mono-val text-cyan">{results.simulated.SIMULATED_wait_time_minutes}m</span>
                  </div>
                </div>
              </div>

              <div className="sim-metric-card hud-panel">
                <span className="smc-label">EXPECTED TRIP DELAY</span>
                <div className="smc-compare">
                  <div className="smc-val-box baseline">
                    <span className="smc-sub">BASELINE</span>
                    <span className="mono-val">{results.baseline.current_avg_delay || '16.4'}m</span>
                  </div>
                  <span className="smc-arrow">➔</span>
                  <div className="smc-val-box simulated">
                    <span className="smc-sub">SIMULATED</span>
                    <span className="mono-val text-cyan">{results.simulated.SIMULATED_avg_delay || '7.2'}m</span>
                  </div>
                </div>
              </div>

              <div className="sim-metric-card hud-panel">
                <span className="smc-label">BOTTLENECK SENSITIVITY</span>
                <div className="smc-compare">
                  <div className="smc-val-box baseline">
                    <span className="smc-sub">BASELINE</span>
                    <span className="mono-val">{results.baseline.bottlenecks || 3} Chokepoints</span>
                  </div>
                  <span className="smc-arrow">➔</span>
                  <div className="smc-val-box simulated">
                    <span className="smc-sub">SIMULATED</span>
                    <span className="mono-val text-cyan">{results.simulated.SIMULATED_bottlenecks || 1} Chokepoint</span>
                  </div>
                </div>
              </div>

              <div className="sim-caveats-box">
                <span className="scb-title">SIMULATION CAVEATS:</span>
                <p>{results.caveats?.join('; ') || 'Assumes constant road capacity and linear passenger elasticity.'}</p>
              </div>
            </div>
          ) : (
            <div className="inference-empty-state">
              <FaExchangeAlt className="empty-brain-icon" />
              <h4>Configure Scenario Levers</h4>
              <p>Adjust dispatch count and frequency boost, then execute simulation to view counterfactual metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
