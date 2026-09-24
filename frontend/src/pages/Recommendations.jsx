import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../api/client';
import { FaLightbulb, FaCheck, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Recommendations.css';

const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    recommendationsAPI.list().then(res => setRecs(res.data || []));
  }, []);

  return (
    <div className="page-container recommendations-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Evidence-Based Operational Recommendations</h1>
          <p className="page-desc">
            Algorithmic dispatch and scheduling interventions calculated strictly from empirical headway, delay, and load thresholds.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {recs.map((r, i) => (
          <div 
            key={i} 
            className="chart-card" 
            style={{ 
              borderLeft: i % 2 === 0 ? '4px solid var(--accent-aurora)' : '4px solid var(--accent-gold)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className={`badge-pill ${i % 2 === 0 ? 'badge-aurora' : 'badge-gold'}`}>
                PRIORITY #{r.priority || (i + 1)}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent-aurora)' }}>
                Confidence: {r.confidence_level}
              </span>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{r.recommendation}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '14px', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Empirical Rationale:</strong> {r.reason}
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.65)', padding: '14px 18px', borderRadius: 'var(--radius-ios-sm)', fontSize: '0.88rem', marginBottom: '16px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <strong style={{ color: 'var(--accent-gold)' }}>Expected Operational Impact:</strong>{' '}
              <span style={{ color: 'var(--text-primary)' }}>{r.expected_impact}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Affected Corridor: <strong style={{ color: 'var(--text-primary)' }}>{r.affected_route}</strong> ({r.affected_time})
              </div>
              <button 
                onClick={() => navigate('/what-if-simulator')}
                className="btn-aurora"
                style={{ fontSize: '0.84rem', padding: '9px 16px' }}
              >
                Simulate Intervention in Sandbox <FaArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
