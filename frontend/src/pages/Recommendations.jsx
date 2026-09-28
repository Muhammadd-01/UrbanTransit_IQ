import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../api/client';
import { FaLightbulb, FaCheck, FaArrowRight, FaShieldAlt, FaBolt, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/common/KPICard';
import './Recommendations.css';
import PipelineBanner from '../components/common/PipelineBanner';

const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    recommendationsAPI.list()
      .then(res => setRecs(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayRecs = recs;

  return (
    <div className="page-container recommendations-page">
      <PipelineBanner contextMessage="Train the AI to generate smart recommendations for improving transit service across all routes." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>SMART RECOMMENDATIONS — AI-SUGGESTED IMPROVEMENTS</span>
          </div>
          <h1 className="hero-main-title">Operational Recommendations</h1>
          <p className="hero-desc">
            The AI analyzes your transit data and suggests specific actions to reduce delays, prevent overcrowding, and improve service quality.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaLightbulb className="text-cyan" /> {loading ? 'CALCULATING...' : `${displayRecs.length} RECOMMENDATIONS`}</span>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="recommendations-list">
        {loading && (
          <div style={{padding: '30px', textAlign: 'center', color: 'var(--color-cyan)', fontSize: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'}}>
            <FaBolt className="pulse-beacon-cyan" size={32} />
            <span>AI is analyzing 2M+ records to generate dynamic operational recommendations...</span>
          </div>
        )}
        {!loading && displayRecs.length === 0 && (
          <div style={{padding: '20px', color: '#64748B'}}>No recommendations available at this time.</div>
        )}
        {displayRecs.map((r, i) => (
          <div 
            key={i} 
            className="chart-card rec-card hud-panel hud-corners"
            style={{ 
              borderLeft: r.priority === 1 
                ? '3px solid var(--color-danger)' 
                : (r.priority === 2 ? '3px solid var(--color-warning)' : '3px solid var(--color-accent)') 
            }}
          >
            <div className="rec-card-top">
              <div className="rec-priority-pill">
                <span className={`status-badge-chip ${r.priority === 1 ? 'quarantined' : (r.priority === 2 ? 'corrected' : 'valid')}`}>
                  PRIORITY #{r.priority || (i + 1)}
                </span>
                <span className="rec-route-code">ROUTE: <strong>{r.affected_route}</strong></span>
              </div>
              <span className="rec-confidence mono-val text-cyan">
                Confidence: {r.confidence_level}
              </span>
            </div>

            <h3 className="rec-title">{r.recommendation}</h3>

            <div className="rec-section-box">
              <strong>Why This Is Recommended:</strong>
              <p>{r.reason}</p>
              {r.evidence_metric && (
                <div className="rec-evidence-tag mono-val text-gold">
                  SUPPORTING DATA: {r.evidence_metric}
                </div>
              )}
            </div>

            <div className="rec-impact-callout">
              <strong className="text-cyan">Expected Improvement:</strong>
              <p>{r.expected_impact}</p>
            </div>

            <div className="rec-footer-row">
              <div className="rec-footer-meta">
                <span>BEST TIME TO ACT: <strong className="mono-val">{r.affected_time}</strong></span>
              </div>
              <button 
                onClick={() => navigate('/what-if-simulator')}
                className="btn-primary-hud"
              >
                Test This Scenario <FaArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
