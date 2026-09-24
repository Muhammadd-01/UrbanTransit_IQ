import React, { useState, useEffect } from 'react';
import { anomalyAPI } from '../api/client';
import { FaExclamationTriangle, FaShieldAlt, FaCrosshairs } from 'react-icons/fa';
import './AnomalyDetection.css';

const AnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    anomalyAPI.detect().then(res => setAnomalies(res.data.anomalies || []));
  }, []);

  return (
    <div className="page-container anomalydetection-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Anomaly Detection & Incident Isolation</h1>
          <p className="page-desc">
            Isolation Forest algorithms and 3-Sigma Z-Score detectors actively filtering irregular telemetry surges, bunching events, and corridor stalls.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {anomalies.map((a, i) => (
          <div key={i} className="chart-card" style={{ borderLeft: '4px solid var(--accent-coral)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge-pill badge-coral">
                <FaExclamationTriangle /> {a.type}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Severity Score: <strong style={{ color: 'var(--accent-coral)', fontSize: '0.95rem' }}>{a.score}</strong>
              </span>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Telemetry Event: <code style={{ color: 'var(--accent-amethyst)', background: 'rgba(124, 58, 237, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>{a.record_id}</code>
            </div>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {a.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnomalyDetection;
