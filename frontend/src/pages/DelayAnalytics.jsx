import React, { useState } from 'react';
import { predictionsAPI } from '../api/client';
import { FaClock, FaCheckCircle, FaExclamationCircle, FaBrain, FaSlidersH } from 'react-icons/fa';
import './DelayAnalytics.css';

const DelayAnalytics = () => {
  const [routeId, setRouteId] = useState('PB-01');
  const [hour, setHour] = useState(8);
  const [passengerLoad, setPassengerLoad] = useState(58);
  const [historicalDelay, setHistoricalDelay] = useState(8.5);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await predictionsAPI.predictDelay({
        route_id: routeId,
        hour: Number(hour),
        passenger_load: Number(passengerLoad),
        historical_delay: Number(historicalDelay),
        day_of_week: 1,
        is_peak: [7, 8, 9, 17, 18, 19].includes(Number(hour))
      });
      setPrediction(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container delayanalytics-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Delay Prediction Sandbox</h1>
          <p className="page-desc">
            Simulate Karachi transit network congestion, passenger choke-points, and real-time multi-class delay risk.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FaSlidersH style={{ color: 'var(--accent-aurora)' }} />
            <h3>Interactive Delay Predictor</h3>
          </div>
          <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '16px' }}>
            <div className="delay-form-group">
              <label>TRANSIT ROUTE</label>
              <select 
                value={routeId} onChange={e => setRouteId(e.target.value)}
              >
                <option value="PB-01">PB-01 (Peoples Bus: Model Colony to Tower)</option>
                <option value="GL-01">GL-01 (Green Line BRT: Surjani to Numaish)</option>
                <option value="PB-08">PB-08 (Korangi to Saddar)</option>
                <option value="LB-04">LB-04 (Liaquatabad Local)</option>
              </select>
            </div>

            <div className="delay-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>HOUR OF DAY</label>
                <span style={{ color: 'var(--accent-aurora)', fontWeight: '800', fontSize: '0.85rem' }}>{hour}:00</span>
              </div>
              <input 
                type="range" min="6" max="22" value={hour} 
                onChange={e => setHour(e.target.value)} 
                className="delay-range-slider"
              />
            </div>

            <div className="delay-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>PASSENGER ONBOARD LOAD</label>
                <span style={{ color: 'var(--accent-gold)', fontWeight: '800', fontSize: '0.85rem' }}>{passengerLoad} Pax</span>
              </div>
              <input 
                type="range" min="10" max="95" value={passengerLoad} 
                onChange={e => setPassengerLoad(e.target.value)} 
                className="delay-range-slider"
              />
            </div>

            <div className="delay-form-group">
              <label>HISTORICAL AVERAGE DELAY (MINUTES)</label>
              <input 
                type="number" step="0.5" value={historicalDelay} 
                onChange={e => setHistoricalDelay(e.target.value)}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="btn-aurora"
              style={{ marginTop: '8px', justifyContent: 'center', width: '100%' }}
            >
              {loading ? 'Executing Neural Inference...' : 'Predict Delay Risk'}
            </button>
          </form>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FaBrain style={{ color: 'var(--accent-gold)' }} />
            <h3>ML Model Inference Results</h3>
          </div>

          {prediction ? (
            <div style={{ marginTop: '16px' }}>
              <div className="inference-result-box">
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  PREDICTED DELAY DURATION
                </div>
                <div className="inference-delay-val">
                  {prediction.predicted_delay} <span>min</span>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <span className={`badge-pill ${prediction.severity === 'Minor' ? 'badge-aurora' : (prediction.severity === 'Moderate' ? 'badge-gold' : 'badge-coral')}`}>
                    {prediction.severity} Delay Risk
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Confidence Score:</span>
                  <strong style={{ color: 'var(--accent-aurora)' }}>{(prediction.confidence * 100).toFixed(1)}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Model Architecture:</span>
                  <code style={{ color: 'var(--accent-gold)' }}>{prediction.model_used}</code>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.65)', padding: '14px', borderRadius: 'var(--radius-ios-sm)', marginTop: '8px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <em style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{prediction.historical_context}</em>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <FaClock style={{ fontSize: '2.8rem', marginBottom: '14px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.92rem' }}>Adjust operational sliders and click "Predict Delay Risk" to run inference.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DelayAnalytics;
