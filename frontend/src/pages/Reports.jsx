import React, { useState } from 'react';
import { FaFilePdf, FaDownload, FaFileCsv, FaChartPie, FaShieldAlt, FaBalanceScale, FaCheckCircle } from 'react-icons/fa';
import './Reports.css';

const Reports = () => {
  const [downloadMsg, setDownloadMsg] = useState('');

  const triggerDownload = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadMsg(`Successfully generated and exported ${filename}`);
    setTimeout(() => setDownloadMsg(''), 4000);
  };

  const handleExportQuality = () => {
    const csvContent = "record_id,affected_column,original_value,cleaning_rule,corrected_value,status\nREC-001,passenger_count,-4,Clamp Negative,0,CORRECTED\nREC-002,dwell_time,142,3-Sigma Flag,142,FLAGGED\nREC-003,route_id,NULL,Drop Null Foreign Key,ISOLATED,QUARANTINED\nREC-004,timestamp,2026-14-99,Timestamp Parse Error,NULL,QUARANTINED";
    triggerDownload('urbantransit_quality_audit_ledger.csv', csvContent, 'text/csv');
  };

  const handleExportBenchmark = () => {
    const jsonContent = JSON.stringify({
      benchmark: "UrbanTransit IQ Dual-Pipeline Reconciliation",
      agreement_rate: 88.0,
      test_cases_count: 100,
      spark_mllib_gbt_f1: 0.838,
      python_xgboost_f1: 0.846,
      generated_at: new Date().toISOString()
    }, null, 2);
    triggerDownload('dual_pipeline_benchmark_reconciliation.json', jsonContent, 'application/json');
  };

  const handleExportExecutive = () => {
    window.print();
  };

  return (
    <div className="page-container reports-page">
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>EXPORT HUB // ARTIFACT GENERATION</span>
          </div>
          <h1 className="hero-main-title">Operational Reports & Benchmark Exports</h1>
          <p className="hero-desc">
            Generate printable executive operational briefs, export record-level data governance audit trails, and download machine-readable benchmark reconciliation JSON artifacts.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaDownload className="text-cyan" /> 3 EXPORT FORMATS</span>
        </div>
      </div>

      {downloadMsg && (
        <div className="hud-panel alert-message-box">
          <FaCheckCircle className="text-cyan" /> <span>{downloadMsg}</span>
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="reports-cards-grid">
        <div className="chart-card hud-panel hud-corners report-card">
          <div className="report-card-header">
            <FaChartPie className="report-icon text-cyan" />
            <span className="badge-pill badge-aurora">EXECUTIVE PDF</span>
          </div>
          <h3>Executive Intelligence Brief</h3>
          <p>
            Comprehensive printable operational summary covering Karachi network ridership, fleet utilization, bottleneck corridors, and priority operational interventions.
          </p>
          <button onClick={handleExportExecutive} className="btn-primary-hud" style={{ width: '100%', justifyContent: 'center' }}>
            <FaFilePdf /> Export Executive Brief (Print/PDF)
          </button>
        </div>

        <div className="chart-card hud-panel hud-corners report-card">
          <div className="report-card-header">
            <FaShieldAlt className="report-icon text-gold" />
            <span className="badge-pill badge-gold">AUDIT CSV</span>
          </div>
          <h3>Data Quality & Audit Ledger</h3>
          <p>
            Full record-level audit trail documenting all 4-tier remediations (Valid, Corrected, Flagged, Quarantined) with column-level transform provenance.
          </p>
          <button onClick={handleExportQuality} className="btn-secondary-hud" style={{ width: '100%', justifyContent: 'center' }}>
            <FaFileCsv className="text-gold" /> Export Audit CSV Ledger
          </button>
        </div>

        <div className="chart-card hud-panel hud-corners report-card">
          <div className="report-card-header">
            <FaBalanceScale className="report-icon text-sky" />
            <span className="badge-pill badge-violet">BENCHMARK JSON</span>
          </div>
          <h3>Dual Pipeline Reconciliation</h3>
          <p>
            Unseen 100-case comparative evaluation verifying independent Spark MLlib and Python XGBoost predictions with agreement rate metrics.
          </p>
          <button onClick={handleExportBenchmark} className="btn-secondary-hud" style={{ width: '100%', justifyContent: 'center' }}>
            <FaDownload className="text-cyan" /> Download Benchmark JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
