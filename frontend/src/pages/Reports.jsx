import React from 'react';
import { FaFilePdf, FaDownload, FaFileCsv, FaChartPie, FaShieldAlt, FaBalanceScale } from 'react-icons/fa';
import './Reports.css';

const Reports = () => {
  return (
    <div className="page-container reports-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Operational Reports & Competition Exports</h1>
          <p className="page-desc">
            Generate executive transit summaries, data quality audit ledgers, and dual-pipeline model reconciliation exports.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FaChartPie style={{ color: 'var(--accent-aurora)' }} />
            <h3>Executive Intelligence Brief</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '14px 0 20px', lineHeight: '1.5' }}>
            Comprehensive executive summary covering Karachi network throughput, fleet utilization, bottleneck corridors, and priority operational interventions.
          </p>
          <button className="btn-aurora" style={{ width: '100%', justifyContent: 'center' }}>
            <FaFilePdf /> Export Executive PDF Brief
          </button>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FaShieldAlt style={{ color: 'var(--accent-gold)' }} />
            <h3>Data Quality & Audit Ledger</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '14px 0 20px', lineHeight: '1.5' }}>
            Full record-level audit trail documenting all 4-tier remediations (Valid, Corrected, Flagged, Quarantined) with column-level transform provenance.
          </p>
          <button className="btn-ghost-glass" style={{ width: '100%', justifyContent: 'center' }}>
            <FaFileCsv style={{ color: 'var(--accent-gold)' }} /> Export Audit CSV Ledger
          </button>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FaBalanceScale style={{ color: 'var(--accent-violet)' }} />
            <h3>Dual Pipeline Reconciliation</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '14px 0 20px', lineHeight: '1.5' }}>
            Unseen 100-case comparative evaluation verifying independent Spark MLlib and Python XGBoost predictions with agreement rate metrics.
          </p>
          <button className="btn-ghost-glass" style={{ width: '100%', justifyContent: 'center' }}>
            <FaDownload style={{ color: 'var(--accent-violet)' }} /> Download Benchmark JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
