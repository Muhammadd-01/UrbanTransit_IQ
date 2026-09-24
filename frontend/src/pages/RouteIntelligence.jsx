import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/client';
import { FaRoute, FaCheckCircle, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import './RouteIntelligence.css';

const RouteIntelligence = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    analyticsAPI.getRoutePerformance().then(res => setRoutes(res.data.route_scores || []));
  }, []);

  return (
    <div className="page-container routeintel-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Route Intelligence & Performance Scoring</h1>
          <p className="page-desc">
            Empirical multi-factor performance index evaluating Karachi route punctuality, passenger density, and schedule adherence.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
        {routes.map((r, i) => (
          <div key={i} className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="badge-pill badge-aurora">{r.route_id}</span>
              <span className={`badge-pill ${r.status === 'EXCELLENT' ? 'badge-aurora' : (r.status === 'GOOD' ? 'badge-gold' : 'badge-coral')}`}>
                {r.status}
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', color: 'var(--text-primary)' }}>{r.route_name}</h3>
            
            <div className={`route-score-box ${r.composite_score >= 80 ? 'score-aurora' : ''}`}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                COMPOSITE PERFORMANCE SCORE
              </div>
              <div className="route-score-val">
                {r.composite_score} <span>/ 100</span>
              </div>
            </div>

            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Punctuality Rate:</span>
                <strong style={{ color: 'var(--accent-aurora)' }}>{r.components?.punctuality}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Occupancy Index:</span>
                <strong style={{ color: 'var(--accent-gold)' }}>{r.components?.occupancy}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Service Reliability:</span>
                <strong style={{ color: 'var(--accent-violet)' }}>{r.components?.reliability}%</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteIntelligence;
