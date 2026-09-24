import React, { useState } from 'react';
import { simulationsAPI } from '../api/client';
import { FaExchangeAlt, FaShieldAlt, FaSlidersH, FaBolt } from 'react-icons/fa';
import './WhatIfSimulator.css';

const WhatIfSimulator = () => {
  const [routeId, setRouteId] = useState('PB-01');
  const [vehicleCount, setVehicleCount] = useState(3);
  const [frequencyMod, setFrequencyMod] = useState(25);
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
          frequency_modifier: Number(frequencyMod)
        }
      });
      setResults(res.data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container whatif-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Interactive What-If Scenario Simulator</h1>
          <p className="page-desc">
            Simulate operational interventions across Karachi's transit arteries: modulate vehicle headways, fleet dispatch quotas, and frequency bands.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FaSlidersH style={{ color: 'var(--accent-aurora)' }} />
            <h3>Simulation Parameter Levers</h3>
          </div>

          <div className="sim-lever-card">
            <div className="sim-input-row">
              <label>TARGET CORRIDOR / ROUTE</label>
              <select value={routeId} onChange={e => setRouteId(e.target.value)}>
                <option value="PB-01">PB-01 (Model Colony to Tower)</option>
                <option value="GL-01">GL-01 (Green Line BRT)</option>
                <option value="PB-08">PB-08 (Korangi to Saddar)</option>
                <option value="LB-14">LB-14 (Hawksbay Feeder)</option>
              </select>
            </div>

            <div className="sim-input-row">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>ADDITIONAL BUSES IN SERVICE</label>
                <span style={{ color: 'var(--accent-aurora)', fontWeight: '800' }}>+{vehicleCount} Vehicles</span>
              </div>
              <input 
                type="range" min="0" max="10" value={vehicleCount} 
                onChange={e => setVehicleCount(e.target.value)} 
                className="delay-range-slider"
              />
            </div>

            <div className="sim-input-row">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>FREQUENCY BOOST</label>
                <span style={{ color: 'var(--accent-gold)', fontWeight: '800' }}>+{frequencyMod}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={frequencyMod} 
                onChange={e => setFrequencyMod(e.target.value)} 
                className="delay-range-slider"
              />
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="btn-aurora"
              style={{ justifyContent: 'center', width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Simulating Dynamic Network Physics...' : 'Execute Simulation Run'}
            </button>
          </div>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaBolt style={{ color: 'var(--accent-gold)' }} />
              <h3>Intervention Scorecard</h3>
            </div>
            <span className="badge-pill badge-gold">
              SIMULATED PREDICTION
            </span>
          </div>

          {results ? (
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="sim-stat-box">
                  <div className="sim-stat-label">OBSERVED BASELINE OCCUPANCY</div>
                  <div className="sim-stat-value">
                    {(results.baseline.current_avg_occupancy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="sim-stat-box sim-projected">
                  <div className="sim-stat-label" style={{ color: 'var(--accent-aurora)' }}>PROJECTED OCCUPANCY</div>
                  <div className="sim-stat-value sim-highlight">
                    {(results.simulated.SIMULATED_avg_occupancy * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="sim-stat-box">
                  <div className="sim-stat-label">CURRENT PASSENGER WAIT TIME</div>
                  <div className="sim-stat-value">
                    {results.baseline.current_wait_time_minutes} min
                  </div>
                </div>
                <div className="sim-stat-box sim-projected">
                  <div className="sim-stat-label" style={{ color: 'var(--accent-aurora)' }}>PROJECTED WAIT TIME</div>
                  <div className="sim-stat-value sim-highlight">
                    {results.simulated.SIMULATED_wait_time_minutes} min
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.65)', padding: '14px 16px', borderRadius: 'var(--radius-ios-sm)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <strong style={{ color: 'var(--accent-gold)', fontSize: '0.8rem' }}>Simulation Caveats:</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                  {results.caveats?.join('; ') || 'Assumes constant road capacity and linear passenger elasticity.'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <FaExchangeAlt style={{ fontSize: '2.8rem', marginBottom: '14px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.92rem' }}>Configure fleet levers and execute simulation to compute counterfactual impact.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
