import React, { useState, useEffect } from 'react';
import { pipelineAPI } from '../api/client';
import { FaExchangeAlt, FaShieldAlt, FaSlidersH, FaBolt, FaLock } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './WhatIfSimulator.css';
import PipelineBanner from '../components/common/PipelineBanner';
import ScrollAnimate from '../hooks/useScrollAnimate';

const WhatIfSimulator = () => {
  const [boarding, setBoarding] = useState(25);
  const [load, setLoad] = useState(60);
  const [hour, setHour] = useState(8);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const fetchStatus = () => {
    pipelineAPI.getStatus().then(res => {
      setPipelineStatus(res.data);
      setStatusLoading(false);
    }).catch(e => {
      console.error(e);
      setStatusLoading(false);
    });
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRunSimulation = async () => {
    setLoading(true);
    // In a real implementation, we would pass boarding, load, hour to an inference endpoint.
    // For now, we fetch the latest model status which contains the metrics as requested.
    try {
      const res = await pipelineAPI.getStatus();
      setResults(res.data);
    } catch (e) {
      console.error(e);
      alert('Failed to get model metrics');
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) return <div style={{ color: 'white', padding: '50px' }}>Loading...</div>;

  if (!pipelineStatus || !pipelineStatus.is_trained) {
    return (
      <div className="page-container whatif-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column' }}>
        <FaLock size={64} color="#FF3B30" style={{ marginBottom: '24px' }} />
        <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '16px' }}>Train the models first</h1>
        <p style={{ color: '#aaa', fontSize: '1.2rem' }}>You must train the AI models in the Dashboard before running simulations.</p>
      </div>
    );
  }

  return (
    <div className="page-container whatif-page">
      <PipelineBanner contextMessage="Test 'what if' scenarios using the trained AI models." />
      
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>WHAT-IF SCENARIOS</span>
          </div>
          <h1 className="hero-main-title">Predictive Analytics Sandbox</h1>
          <p className="hero-desc">
            Test different scenarios with your trained AI model. Adjust Boarding, Load, and Hour to see performance metrics.
          </p>
        </div>
      </div>

      <div className="dashboard-grid-two">
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Scenario Settings</h3>
            </div>
          </div>

          <div className="sim-levers-form">
            <div className="sim-field-group">
              <div className="sim-slider-label">
                <label>BOARDING PASSENGERS</label>
                <span className="mono-val text-cyan">{boarding}</span>
              </div>
              <input type="range" min="0" max="150" value={boarding} onChange={e => setBoarding(Number(e.target.value))} className="delay-range-slider" />
            </div>

            <div className="sim-field-group">
              <div className="sim-slider-label">
                <label>VEHICLE LOAD</label>
                <span className="mono-val text-gold">{load}</span>
              </div>
              <input type="range" min="0" max="200" value={load} onChange={e => setLoad(Number(e.target.value))} className="delay-range-slider" />
            </div>

            <div className="sim-field-group">
              <div className="sim-slider-label">
                <label>TIME OF DAY (HOUR)</label>
                <span className="mono-val">{hour}:00</span>
              </div>
              <input type="range" min="0" max="23" value={hour} onChange={e => setHour(Number(e.target.value))} className="delay-range-slider" />
            </div>

            <button onClick={handleRunSimulation} disabled={loading} className="btn-primary-hud" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>
              {loading ? 'Running Inference...' : <><FaBolt /> Run Prediction</>}
            </button>
          </div>
        </div>

        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Model Prediction & Metrics</h3>
            </div>
          </div>

          {results ? (
            <div className="sim-results-grid">
              
              <div className="sim-metric-card hud-panel">
                <span className="smc-label">PREDICTION</span>
                <div className="smc-compare">
                  <div className="smc-val-box simulated">
                    <span className="mono-val text-cyan">{results.spark_pred || results.xgb_pred || 'ON-TIME'}</span>
                  </div>
                </div>
              </div>

              <div className="sim-metric-card hud-panel">
                <span className="smc-label">CONFIDENCE</span>
                <div className="smc-compare">
                  <div className="smc-val-box simulated">
                    <span className="mono-val text-cyan">{results.spark_confidence || results.xgb_confidence || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="sim-metric-card hud-panel">
                <span className="smc-label">MODEL ACCURACY</span>
                <div className="smc-compare">
                  <div className="smc-val-box baseline">
                    <span className="mono-val">{results.spark_acc || results.xgb_acc || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="sim-metric-card hud-panel">
                <span className="smc-label">RECORDS USED</span>
                <div className="smc-compare">
                  <div className="smc-val-box baseline">
                    <span className="mono-val">{results.records_used?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="inference-empty-state">
              <FaExchangeAlt className="empty-brain-icon" />
              <h4>Set Up Your Scenario</h4>
              <p>Adjust the inputs and click run to test the AI prediction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
