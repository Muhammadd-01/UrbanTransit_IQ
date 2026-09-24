import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../api/client';
import { FaSlidersH, FaServer, FaMicrochip, FaUsers } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const [thresholds, setThresholds] = useState(null);

  useEffect(() => {
    settingsAPI.getThresholds().then(res => setThresholds(res.data));
  }, []);

  return (
    <div className="page-container settings-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">System Settings & Analytical Thresholds</h1>
          <p className="page-desc">
            Externalized threshold parameters loaded dynamically from <code>config/thresholds.yaml</code> for deterministic transit evaluation.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <FaSlidersH style={{ color: 'var(--accent-aurora)' }} />
            <h3>Configurable Analytical Thresholds</h3>
          </div>

          {thresholds ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div className="threshold-param-box">
                <strong style={{ color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>Overcrowding Thresholds:</strong>
                <div style={{ color: 'var(--text-secondary)' }}>Moderate: {(thresholds.overcrowding?.moderate * 100).toFixed(0)}% | Critical Overcrowded: {(thresholds.overcrowding?.overcrowded * 100).toFixed(0)}%</div>
              </div>
              <div className="threshold-param-box">
                <strong style={{ color: 'var(--accent-aurora)', display: 'block', marginBottom: '4px' }}>Delay Severity Bands (Minutes):</strong>
                <div style={{ color: 'var(--text-secondary)' }}>On-Time: &lt;{thresholds.delay?.on_time}m | Minor: {thresholds.delay?.minor}m | Major: {thresholds.delay?.major}m</div>
              </div>
              <div className="threshold-param-box">
                <strong style={{ color: 'var(--accent-violet)', display: 'block', marginBottom: '4px' }}>Headway Bunching & Gapping:</strong>
                <div style={{ color: 'var(--text-secondary)' }}>Bunching Ratio: {thresholds.headway?.bunching_threshold_ratio}x | Gap Ratio: {thresholds.headway?.gap_threshold_ratio}x scheduled headway</div>
              </div>
            </div>
          ) : <div style={{ color: 'var(--text-muted)' }}>Loading thresholds from YAML...</div>}
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <FaServer style={{ color: 'var(--accent-gold)' }} />
            <h3>Platform & Hardware Architecture Context</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Focus Metropolis:</span>
              <strong style={{ color: 'var(--text-primary)' }}>Karachi, Pakistan</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Execution Mode:</span>
              <span className="badge-pill badge-aurora">DEVELOPMENT (Offline Fallback Supported)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Apache Spark Allocation:</span>
              <strong style={{ color: 'var(--accent-gold)' }}>2GB Driver / 2GB Executor (16GB RAM Mac)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Hadoop HDFS Storage:</span>
              <strong style={{ color: 'var(--text-primary)' }}>Replication 1, 64MB Block Size</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Supabase Database Ledger:</span>
              <strong style={{ color: 'var(--accent-aurora)' }}>PostgreSQL with RLS Enforced</strong>
            </div>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FaUsers style={{ color: 'var(--accent-aurora)' }} />
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>Core Engineering Team:</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Muhammad Affan (Lead) · Muhammad Hammad (Big Data) · Shahmir Qadri (ML) · Waqas Rehman (Data Quality)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
