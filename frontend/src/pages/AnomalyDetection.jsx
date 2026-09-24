import React, { useState, useEffect } from 'react';
import { anomalyAPI } from '../api/client';
import { FaExclamationTriangle, FaShieldAlt, FaCrosshairs, FaClock, FaRoute, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './AnomalyDetection.css';

const DEFAULT_ANOMALIES = [
  {
    type: 'Abnormal Headway & Vehicle Bunching',
    category: 'HEADWAY',
    severity: 'CRITICAL',
    score: 0.94,
    record_id: 'EVT-BUNCH-081',
    route_id: 'PB-01',
    stop_id: 'ST-02 (Regal Chowk)',
    timestamp: 'Today, 08:24:12 PKT',
    magnitude: 'Headway: 1.2 min (Scheduled: 6.5 min)',
    detection_method: '3-Sigma Headway Delta (Z = +3.82)',
    explanation: 'Two Peoples Bus Line 1 vehicles arrived with an interval of only 72 seconds at Saddar Regal Chowk.',
    recommended_action: 'Hold trailing vehicle at Numaish for 3.5 minutes to restore headway equilibrium.'
  },
  {
    type: 'Passenger Volume Surge',
    category: 'SURGE',
    severity: 'MODERATE',
    score: 0.82,
    record_id: 'EVT-SURGE-104',
    route_id: 'GL-01',
    stop_id: 'ST-04 (Numaish Interchange)',
    timestamp: 'Today, 08:10:45 PKT',
    magnitude: '+142% Boarding Spike (4,820 Pax/hr)',
    detection_method: 'Isolation Forest (Ensemble Trees = 100)',
    explanation: 'Sudden boarding surge at Numaish terminal exceeding 99th percentile historical envelope.',
    recommended_action: 'Deploy depot reserve shuttle from Surjani to absorb outbound platform crowding.'
  },
  {
    type: 'GPS Coordinate Telemetry Drift',
    category: 'TELEMETRY',
    severity: 'LOW',
    score: 0.68,
    record_id: 'EVT-DRIFT-022',
    route_id: 'PB-08',
    stop_id: 'ST-06 (Korangi Crossing)',
    timestamp: 'Today, 07:54:19 PKT',
    magnitude: 'Coordinate Delta: 480m off corridor spine',
    detection_method: 'Spatial Bounding Geofence Rule 07',
    explanation: 'Vehicle 142 emitted GPS coordinates outside designated road geometry boundary.',
    recommended_action: 'Audit onboard AVL unit antenna and verify road detour status on Korangi Causeway.'
  }
];

const AnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState(DEFAULT_ANOMALIES);
  const [selectedCat, setSelectedCat] = useState('ALL');

  useEffect(() => {
    anomalyAPI.detect()
      .then(res => {
        if (res.data?.anomalies?.length) {
          // Merge with rich fields
          const merged = res.data.anomalies.map((a, idx) => ({
            ...DEFAULT_ANOMALIES[idx % DEFAULT_ANOMALIES.length],
            ...a
          }));
          setAnomalies(merged);
        }
      })
      .catch(console.error);
  }, []);

  const filtered = selectedCat === 'ALL' 
    ? anomalies 
    : anomalies.filter(a => a.category === selectedCat);

  return (
    <div className="page-container anomalydetection-page">
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>UNSUPERVISED MACHINE LEARNING // INCIDENT ISOLATION</span>
          </div>
          <h1 className="hero-main-title">Anomaly Detection & Telemetry Outliers</h1>
          <p className="hero-desc">
            Isolation Forest algorithms and 3-Sigma statistical z-score detectors actively monitoring headway degradation, passenger surges, and spatial telemetry drift.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaShieldAlt className="text-cyan" /> ISOLATION FOREST: ACTIVE</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="kpi-grid-four">
        <KPICard 
          title="ACTIVE INCIDENTS"
          value={String(anomalies.length)}
          techCode="OUT // ACTIVE"
          change="2"
          changeDirection="down"
          subtitle="Filtered from 260K delay logs"
          progress={18}
          colorScheme="coral"
          icon={<FaExclamationTriangle />}
        />
        <KPICard 
          title="BUNCHING EVENTS"
          value="4"
          techCode="BUNCH // CNT"
          change="1"
          changeDirection="down"
          subtitle="Headways &lt; 2.0 min"
          progress={25}
          colorScheme="gold"
          icon={<FaRoute />}
        />
        <KPICard 
          title="PASSENGER SURGES"
          value="2"
          techCode="SURGE // CNT"
          change="0"
          changeDirection="up"
          subtitle="&gt;3.0 Z-score boardings"
          progress={40}
          colorScheme="sky"
          icon={<FaCrosshairs />}
        />
        <KPICard 
          title="DETECTION LATENCY"
          value="840ms"
          techCode="LAT // DET"
          change="12"
          changeDirection="down"
          subtitle="Stream telemetry evaluation"
          progress={95}
          colorScheme="cyan"
          icon={<FaClock />}
        />
      </div>

      {/* Anomaly Category Filter Chips */}
      <div className="chart-card hud-panel hud-corners">
        <div className="audit-controls-header">
          <div>
            <h3>Active Operational Anomaly Stream</h3>
            <span className="chart-subtitle">Real-time incident feed classified by multi-dimensional telemetry detection</span>
          </div>

          <div className="audit-chip-group">
            {['ALL', 'HEADWAY', 'SURGE', 'TELEMETRY'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`filter-chip-btn ${selectedCat === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="anomaly-cards-list">
          {filtered.map((a, i) => (
            <div 
              key={i} 
              className="hud-panel anomaly-item-card"
              style={{
                borderLeft: a.severity === 'CRITICAL' 
                  ? '3px solid var(--color-danger)' 
                  : (a.severity === 'MODERATE' ? '3px solid var(--color-warning)' : '3px solid var(--color-accent)')
              }}
            >
              <div className="aic-header">
                <div className="aic-title-block">
                  <span className={`status-badge-chip ${a.severity === 'CRITICAL' ? 'quarantined' : (a.severity === 'MODERATE' ? 'corrected' : 'valid')}`}>
                    {a.severity}
                  </span>
                  <h4 className="aic-title">{a.type}</h4>
                </div>
                <span className="mono-val text-dim">SCORE: <strong>{a.score}</strong></span>
              </div>

              <div className="aic-spec-grid">
                <div className="aic-spec">
                  <span className="aic-label">AFFECTED CORRIDOR:</span>
                  <strong className="mono-val">{a.route_id}</strong>
                </div>
                <div className="aic-spec">
                  <span className="aic-label">LOCATION:</span>
                  <span className="text-cyan">{a.stop_id}</span>
                </div>
                <div className="aic-spec">
                  <span className="aic-label">TIMESTAMP:</span>
                  <span className="mono-val text-dim">{a.timestamp}</span>
                </div>
                <div className="aic-spec">
                  <span className="aic-label">DETECTION METHOD:</span>
                  <span className="mono-val text-gold">{a.detection_method}</span>
                </div>
              </div>

              <div className="aic-narrative">
                <p><strong>Incident Telemetry:</strong> {a.explanation}</p>
                <div className="aic-mag mono-val text-coral">MAGNITUDE: {a.magnitude}</div>
              </div>

              <div className="aic-remedy-box">
                <span className="aic-remedy-title">RECOMMENDED OPERATIONAL INVESTIGATION:</span>
                <p>{a.recommended_action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;
