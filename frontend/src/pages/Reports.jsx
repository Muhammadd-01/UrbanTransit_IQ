import React, { useState } from 'react';
import { FaFilePdf, FaDownload, FaFileCsv, FaChartPie, FaShieldAlt, FaBalanceScale, FaCheckCircle } from 'react-icons/fa';
import './Reports.css';
import PipelineBanner from '../components/common/PipelineBanner';

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

  const handleExportQuality = async () => {
    try {
      const { exportAPI } = await import('../api/client');
      const res = await exportAPI.exportData({ type: 'quality_audit' });
      triggerDownload('urbantransit_quality_audit_ledger.csv', res.data, 'text/csv');
    } catch (e) {
      console.error(e);
      setDownloadMsg('Export failed.');
      setTimeout(() => setDownloadMsg(''), 4000);
    }
  };

  const handleExportBenchmark = async () => {
    try {
      const { exportAPI } = await import('../api/client');
      const res = await exportAPI.exportResults({ type: 'benchmark' });
      triggerDownload('dual_pipeline_benchmark_reconciliation.json', res.data, 'application/json');
    } catch (e) {
      console.error(e);
      setDownloadMsg('Export failed.');
      setTimeout(() => setDownloadMsg(''), 4000);
    }
  };

  const handleExportExecutive = () => {
    window.print();
  };

  return (
    <div className="page-container reports-page">
      <PipelineBanner contextMessage="Generate and download reports based on your verified transit data and AI model results." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>REPORTS & EXPORTS — DOWNLOAD YOUR DATA</span>
          </div>
          <h1 className="hero-main-title">Reports & Data Exports</h1>
          <p className="hero-desc">
            Download summary reports, detailed data audits, and AI model comparison results in PDF, CSV, or JSON format.
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
          <h3>Executive Summary Report</h3>
          <p>
            A complete overview of Karachi's transit performance including passenger numbers, fleet status, problem areas, and recommended actions.
          </p>
          <button onClick={handleExportExecutive} className="btn-primary-hud" style={{ width: '100%', justifyContent: 'center' }}>
            <FaFilePdf /> Download Executive Summary (PDF)
          </button>
        </div>

        <div className="chart-card hud-panel hud-corners report-card">
          <div className="report-card-header">
            <FaShieldAlt className="report-icon text-gold" />
            <span className="badge-pill badge-gold">AUDIT CSV</span>
          </div>
          <h3>Data Quality Audit Report</h3>
          <p>
            Detailed record of how every data issue was found and fixed, showing what was valid, corrected, flagged, or removed.
          </p>
          <button onClick={handleExportQuality} className="btn-secondary-hud" style={{ width: '100%', justifyContent: 'center' }}>
            <FaFileCsv className="text-gold" /> Download Data Audit (CSV)
          </button>
        </div>

        <div className="chart-card hud-panel hud-corners report-card">
          <div className="report-card-header">
            <FaBalanceScale className="report-icon text-sky" />
            <span className="badge-pill badge-violet">AI COMPARISON REPORT</span>
          </div>
          <h3>AI Model Comparison Report</h3>
          <p>
            Test report comparing how well both AI models agree when predicting delays on 100 unseen bus trips.
          </p>
          <button onClick={handleExportBenchmark} className="btn-secondary-hud" style={{ width: '100%', justifyContent: 'center' }}>
            <FaDownload className="text-cyan" /> Download AI Comparison (JSON)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
