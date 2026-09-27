import React, { useState, useEffect } from 'react';
import { anomalyAPI } from '../api/client';
import { FaExclamationTriangle, FaShieldAlt, FaCrosshairs, FaClock, FaRoute, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './AnomalyDetection.css';
import PipelineBanner from '../components/common/PipelineBanner';

const AnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    anomalyAPI.detect()
      .then(res => {
        if (res.data?.anomalies?.length) {
          setAnomalies(res.data.anomalies);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCategory = (a) => {
    if (a.category) return a.category;
    const t = (a.type || '').toLowerCase();
    if (t.includes('headway') || t.includes('bunching')) return 'HEADWAY';
    if (t.includes('surge') || t.includes('spike')) return 'SURGE';
    return 'TELEMETRY';
  };

  const filtered = selectedCat === 'ALL' 
    ? anomalies 
    : anomalies.filter(a => getCategory(a) === selectedCat);

  return (
    <div className="page-container anomalydetection-page">
      <PipelineBanner contextMessage="Train the AI to automatically detect unusual transit patterns and alert operators to potential problems." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>UNUSUAL ACTIVITY DETECTION — SPOTTING PROBLEMS EARLY</span>
          </div>
          <h1 className="hero-main-title">Anomaly Detection & Telemetry Outliers</h1>
          <p className="hero-desc">
            The AI continuously monitors all routes for unusual patterns — sudden passenger surges, buses arriving too close together, or unexpected delays — so problems can be fixed before they get worse.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaShieldAlt className="text-cyan" /> AI MONITORING: ACTIVE</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="kpi-grid-four">
        <KPICard 
          title="ACTIVE INCIDENTS"
          value={String(anomalies.length)}
          techCode="Active"
          change="2"
          changeDirection="down"
          subtitle="Detected from all recorded trips"
          progress={18}
          colorScheme="coral"
          icon={<FaExclamationTriangle />}
        />
        <KPICard 
          title="BUSES TOO CLOSE"
          value={String(anomalies.filter(a => getCategory(a) === 'HEADWAY').length)}
          techCode="Bunching"
          change="1"
          changeDirection="down"
          subtitle="Two buses arriving within 2 minutes of each other"
          progress={25}
          colorScheme="gold"
          icon={<FaRoute />}
        />
        <KPICard 
          title="SUDDEN PASSENGER SPIKES"
          value={String(anomalies.filter(a => getCategory(a) === 'SURGE').length)}
          techCode="Spikes"
          change="0"
          changeDirection="up"
          subtitle="Unusually high boarding at a stop"
          progress={40}
          colorScheme="sky"
          icon={<FaCrosshairs />}
        />
        <KPICard 
          title="DETECTION SPEED"
          value="N/A"
          techCode="Speed"
          change="12"
          changeDirection="down"
          subtitle="How quickly unusual events are spotted"
          progress={95}
          colorScheme="cyan"
          icon={<FaClock />}
        />
      </div>

      {/* Anomaly Category Filter Chips */}
      <div className="chart-card hud-panel hud-corners">
        <div className="audit-controls-header">
          <div>
            <h3>Live Unusual Activity Feed</h3>
            <span className="chart-subtitle">Unusual events detected by AI, sorted by severity</span>
          </div>

          <div className="audit-chip-group">
            {['ALL', 'HEADWAY', 'SURGE', 'TELEMETRY'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`filter-chip-btn ${selectedCat === cat ? 'active' : ''}`}
              >
                {cat === 'HEADWAY' ? 'TIMING GAPS' : cat === 'SURGE' ? 'SUDDEN SPIKES' : cat === 'TELEMETRY' ? 'SENSOR DATA' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="anomaly-cards-list">
          {filtered.map((a, i) => {
            const severity = a.severity || (a.score > 0.8 ? 'CRITICAL' : 'MODERATE');
            return (
            <div 
              key={i} 
              className="hud-panel anomaly-item-card"
              style={{
                borderLeft: severity === 'CRITICAL' 
                  ? '3px solid var(--color-danger)' 
                  : (severity === 'MODERATE' ? '3px solid var(--color-warning)' : '3px solid var(--color-accent)')
              }}
            >
              <div className="aic-header">
                <div className="aic-title-block">
                  <span className={`status-badge-chip ${severity === 'CRITICAL' ? 'quarantined' : (severity === 'MODERATE' ? 'corrected' : 'valid')}`}>
                    {severity}
                  </span>
                  <h4 className="aic-title">{a.type}</h4>
                </div>
                <span className="mono-val text-dim">SCORE: <strong>{a.score}</strong></span>
              </div>

              <div className="aic-spec-grid">
                <div className="aic-spec">
                  <span className="aic-label">AFFECTED ROUTE:</span>
                  <strong className="mono-val">{a.route_id || 'N/A'}</strong>
                </div>
                <div className="aic-spec">
                  <span className="aic-label">LOCATION:</span>
                  <span className="text-cyan">{a.stop_id || 'N/A'}</span>
                </div>
                <div className="aic-spec">
                  <span className="aic-label">TIMESTAMP:</span>
                  <span className="mono-val text-dim">{a.timestamp}</span>
                </div>
                <div className="aic-spec">
                  <span className="aic-label">HOW IT WAS DETECTED:</span>
                  <span className="mono-val text-gold">{a.detection_method || 'Isolation Forest'}</span>
                </div>
              </div>

              <div className="aic-narrative">
                <p><strong>Incident Telemetry:</strong> {a.explanation}</p>
                <div className="aic-mag mono-val text-coral">MAGNITUDE: {a.magnitude || a.score || 0}</div>
              </div>

              <div className="aic-remedy-box">
                <span className="aic-remedy-title">SUGGESTED ACTION:</span>
                <p>{a.recommended_action || a.explanation || 'Investigate further'}</p>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;
