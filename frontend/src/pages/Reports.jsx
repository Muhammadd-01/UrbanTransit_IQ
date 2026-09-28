import React, { useState } from 'react';
import { FaFilePdf, FaDownload, FaFileCsv, FaChartPie, FaShieldAlt, FaBalanceScale, FaCheckCircle, FaCogs, FaUsers, FaClock, FaRoute } from 'react-icons/fa';
import './Reports.css';
import PipelineBanner from '../components/common/PipelineBanner';
import { pipelineAPI, analyticsAPI } from '../api/client';

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
    setDownloadMsg(`Successfully exported ${filename}`);
    setTimeout(() => setDownloadMsg(''), 4000);
  };

  const convertToCSV = (objArray) => {
    if (!objArray || (Array.isArray(objArray) && objArray.length === 0)) return '';
    let array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    
    // For single objects like pipeline status
    const dataArray = Array.isArray(array) ? array : [array];
    if (dataArray.length === 0) return '';

    let str = '';
    // headers
    const headers = Object.keys(dataArray[0]);
    str += headers.join(',') + '\r\n';

    for (let i = 0; i < dataArray.length; i++) {
      let line = '';
      for (let j = 0; j < headers.length; j++) {
        if (line !== '') line += ',';
        
        let val = dataArray[i][headers[j]];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') {
          val = JSON.stringify(val).replace(/"/g, '""');
        } else if (typeof val === 'string') {
          val = val.replace(/"/g, '""');
        }
        line += `"${val}"`;
      }
      str += line + '\r\n';
    }
    return str;
  };

  const exportPipelineResults = async (format) => {
    try {
      const res = await pipelineAPI.getStatus();
      const data = res.data;
      if (format === 'json') {
        triggerDownload('pipeline_results.json', JSON.stringify(data, null, 2), 'application/json');
      } else {
        triggerDownload('pipeline_results.csv', convertToCSV(data), 'text/csv');
      }
    } catch (e) {
      console.error(e);
      setDownloadMsg('Export failed.');
      setTimeout(() => setDownloadMsg(''), 4000);
    }
  };

  const exportPassengerAnalytics = async (format) => {
    try {
      const res = await analyticsAPI.getPassengerFlow({});
      const data = res.data;
      if (format === 'json') {
        triggerDownload('passenger_analytics.json', JSON.stringify(data, null, 2), 'application/json');
      } else {
        triggerDownload('passenger_analytics.csv', convertToCSV(data), 'text/csv');
      }
    } catch (e) {
      console.error(e);
      setDownloadMsg('Export failed.');
      setTimeout(() => setDownloadMsg(''), 4000);
    }
  };

  const exportDelayReport = async (format) => {
    try {
      const res = await analyticsAPI.getDelays({});
      const data = res.data;
      if (format === 'json') {
        triggerDownload('delay_report.json', JSON.stringify(data, null, 2), 'application/json');
      } else {
        triggerDownload('delay_report.csv', convertToCSV(data), 'text/csv');
      }
    } catch (e) {
      console.error(e);
      setDownloadMsg('Export failed.');
      setTimeout(() => setDownloadMsg(''), 4000);
    }
  };

  const exportRoutePerformance = async (format) => {
    try {
      const res = await analyticsAPI.getRoutes();
      const data = res.data;
      if (format === 'json') {
        triggerDownload('route_performance.json', JSON.stringify(data, null, 2), 'application/json');
      } else {
        triggerDownload('route_performance.csv', convertToCSV(data), 'text/csv');
      }
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
          <span className="sys-badge"><FaDownload className="text-cyan" /> EXPORT FORMATS</span>
        </div>
      </div>

      {downloadMsg && (
        <div className="hud-panel alert-message-box" style={{ marginBottom: '20px' }}>
          <FaCheckCircle className="text-cyan" /> <span>{downloadMsg}</span>
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="reports-cards-grid">
        <div className="chart-card hud-panel hud-corners report-card">
          <div className="report-card-header">
            <FaCogs className="report-icon text-cyan" />
            <span className="badge-pill badge-aurora">PIPELINE RESULTS</span>
          </div>
          <h3>Pipeline Results</h3>
          <p>Export the trained model metrics from the pipeline status.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => exportPipelineResults('csv')} className="btn-secondary-hud" style={{ flex: 1, justifyContent: 'center' }}>
              <FaFileCsv className="text-gold" /> CSV
            </button>
            <button onClick={() => exportPipelineResults('json')} className="btn-secondary-hud" style={{ flex: 1, justifyContent: 'center' }}>
              <FaDownload className="text-cyan" /> JSON
            </button>
          </div>
        </div>

        <div className="chart-card hud-panel hud-corners report-card">
          <div className="report-card-header">
            <FaUsers className="report-icon text-gold" />
            <span className="badge-pill badge-gold">PASSENGER ANALYTICS</span>
          </div>
          <h3>Passenger Analytics</h3>
          <p>Export passenger flow and analytics data.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => exportPassengerAnalytics('csv')} className="btn-secondary-hud" style={{ flex: 1, justifyContent: 'center' }}>
              <FaFileCsv className="text-gold" /> CSV
            </button>
            <button onClick={() => exportPassengerAnalytics('json')} className="btn-secondary-hud" style={{ flex: 1, justifyContent: 'center' }}>
              <FaDownload className="text-cyan" /> JSON
            </button>
          </div>
        </div>

        <div className="chart-card hud-panel hud-corners report-card">
          <div className="report-card-header">
            <FaClock className="report-icon text-sky" />
            <span className="badge-pill badge-violet">DELAY REPORT</span>
          </div>
          <h3>Delay Report</h3>
          <p>Export delay analytics and prediction reports.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => exportDelayReport('csv')} className="btn-secondary-hud" style={{ flex: 1, justifyContent: 'center' }}>
              <FaFileCsv className="text-gold" /> CSV
            </button>
            <button onClick={() => exportDelayReport('json')} className="btn-secondary-hud" style={{ flex: 1, justifyContent: 'center' }}>
              <FaDownload className="text-cyan" /> JSON
            </button>
          </div>
        </div>

        <div className="chart-card hud-panel hud-corners report-card">
          <div className="report-card-header">
            <FaRoute className="report-icon text-emerald" />
            <span className="badge-pill badge-emerald" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981' }}>ROUTE PERFORMANCE</span>
          </div>
          <h3>Route Performance</h3>
          <p>Export overall route performance and metrics.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => exportRoutePerformance('csv')} className="btn-secondary-hud" style={{ flex: 1, justifyContent: 'center' }}>
              <FaFileCsv className="text-gold" /> CSV
            </button>
            <button onClick={() => exportRoutePerformance('json')} className="btn-secondary-hud" style={{ flex: 1, justifyContent: 'center' }}>
              <FaDownload className="text-cyan" /> JSON
            </button>
          </div>
        </div>
        
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
      </div>
    </div>
  );
};

export default Reports;
