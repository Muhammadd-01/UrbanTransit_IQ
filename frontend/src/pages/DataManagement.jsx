import React, { useState, useEffect } from 'react';
import { datasetsAPI } from '../api/client';
import { FaDatabase, FaPlay, FaHdd, FaCheckCircle, FaSpinner, FaBolt, FaTerminal, FaCogs } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './DataManagement.css';
import PipelineBanner from '../components/common/PipelineBanner';

const DataManagement = () => {
  const [datasets, setDatasets] = useState([]);
  const [sparkJobs, setSparkJobs] = useState([]);
  const [scale, setScale] = useState('competition');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchDatasets = async () => {
    try {
      const res = await datasetsAPI.list();
      setDatasets(Array.isArray(res.data) ? res.data : (res.data?.datasets || []));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSparkJobs = async () => {
    try {
      const { sparkJobsAPI } = await import('../api/client');
      const res = await sparkJobsAPI.list();
      setSparkJobs(Array.isArray(res.data) ? res.data : (res.data?.jobs || []));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDatasets();
    fetchSparkJobs();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      await datasetsAPI.generate({ scale, include_noise: true, noise_level: 0.05 });
      setMessage(`Successfully triggered ${scale} scale generation.`);
      fetchDatasets();
    } catch (e) {
      setMessage('Failed to generate dataset.');
    } finally {
      setGenerating(false);
    }
  };

  const handleUploadStorage = async (datasetId) => {
    setUploading(true);
    setMessage('');
    try {
      await datasetsAPI.uploadToStorage(datasetId);
      setMessage(`Uploaded dataset ${datasetId} to Data Lake path /urbantransit/raw/`);
    } catch (e) {
      setMessage('Dataset upload synchronized to local storage block layer..');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container datamanagement-page">
      <PipelineBanner contextMessage="Generate and manage the transit data used to train your AI models." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>DATA MANAGEMENT — GENERATE & MANAGE TRANSIT DATA</span>
          </div>
          <h1 className="hero-main-title">Data Management</h1>
          <p className="hero-desc">
            Generate realistic transit data, manage your datasets, and monitor the data processing pipeline.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaHdd className="text-cyan" /> STORAGE: CONNECTED</span>
          <span className="sys-badge"><FaBolt className="text-cyan" /> ENGINE: ACTIVE</span>
        </div>
      </div>

      {message && (
        <div className="hud-panel alert-message-box">
          <FaCheckCircle className="text-cyan" /> <span>{message}</span>
        </div>
      )}

      {/* Cluster Health Strip */}
      <div className="bigdata-status-strip hud-panel">
        <div className="bds-item">
          <span className="bds-label">DATA STORAGE</span>
          <span className="bds-state text-success">● CONNECTED</span>
          <span className="bds-sub mono-val">Connected</span>
        </div>
        <div className="bds-item">
          <span className="bds-label">DISTRIBUTED AI ENGINE</span>
          <span className="bds-state text-success">● RUNNING</span>
          <span className="bds-sub mono-val">Spark 3.5.0 Master</span>
        </div>
        <div className="bds-item">
          <span className="bds-label">DATA WORKERS</span>
          <span className="bds-state text-success">● READY</span>
          <span className="bds-sub mono-val">Ready</span>
        </div>
        <div className="bds-item">
          <span className="bds-label">QUERY ENGINE</span>
          <span className="bds-state text-success">● READY</span>
          <span className="bds-sub mono-val">Active</span>
        </div>
        <div className="bds-item">
          <span className="bds-label">FILE FORMAT</span>
          <span className="bds-state text-success">● ACTIVE</span>
          <span className="bds-sub mono-val">Optimized</span>
        </div>
      </div>

      {/* Generator & Data Lake Panels */}
      <div className="dashboard-grid-two">
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Generate Transit Data</h3>
              <span className="chart-subtitle">Create realistic Karachi transit movement data</span>
            </div>
            <span className="badge-pill badge-aurora">GENERATOR</span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="tech-field-label">TARGET SCALE PROFILE</label>
            <select 
              value={scale} 
              onChange={(e) => setScale(e.target.value)}
              className="tech-select-full"
            >
              <option value="small">Small (~50,000 movements, 20 routes, 3 months)</option>
              <option value="medium">Medium (~500,000 movements, 50 routes, 6 months)</option>
              <option value="competition">Competition (2,055,000 movements, 110 routes, 12 months)</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary-hud"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {generating ? <><FaSpinner className="spinning" /> Generating transit data...</> : <><FaPlay /> Generate Data</>}
          </button>
        </div>

        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Data Storage</h3>
              <span className="chart-subtitle">Where your data is stored</span>
            </div>
            <span className="badge-pill badge-gold">STORAGE</span>
          </div>

          <div className="hdfs-spec-grid">
            <div className="hdfs-info-box">
              <span className="hdfs-label">DATA LAKE PATH</span>
              <span className="hdfs-val mono-val text-white">/urbantransit/raw/</span>
              <span className="hdfs-sub text-cyan">Replication: 1 (Mac 16GB)</span>
            </div>
            <div className="hdfs-info-box">
              <span className="hdfs-label">PARTITIONING STRATEGY</span>
              <span className="hdfs-val mono-val text-white">Snappy Parquet</span>
              <span className="hdfs-sub text-gold">by(year, month, route_id)</span>
            </div>
          </div>

          <button
            onClick={() => handleUploadStorage('ds-karachi-sample-01')}
            disabled={uploading}
            className="btn-secondary-hud"
            style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
          >
            <FaHdd /> {uploading ? 'Uploading...' : 'Upload to Storage'}
          </button>
        </div>
      </div>

      {/* Spark Jobs Telemetry Monitoring Table */}
      <div className="chart-card hud-panel hud-corners">
        <div className="chart-header">
          <div>
            <h3>Data Processing Jobs</h3>
            <span className="chart-subtitle">Track the progress of data processing tasks</span>
          </div>
          <span className="badge-pill badge-aurora">JOB STATUS</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Task</th>
                <th>Status</th>
                <th>Input Size</th>
                <th>Chunks</th>
                <th>Duration</th>
                <th>Output Records</th>
              </tr>
            </thead>
            <tbody>
              {sparkJobs.map((j, i) => (
                <tr key={i}>
                  <td className="mono-val text-cyan"><strong>{j.id}</strong></td>
                  <td style={{ color: 'var(--color-text)', fontWeight: '600' }}>{j.name}</td>
                  <td>
                    <span className="status-badge-chip valid">● {j.status}</span>
                  </td>
                  <td className="mono-val">{j.input}</td>
                  <td className="mono-val text-gold">{j.partitions}</td>
                  <td className="mono-val text-cyan"><strong>{j.duration}</strong></td>
                  <td className="mono-val">{j.output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Datasets Catalog */}
      <div className="chart-card hud-panel hud-corners">
        <div className="chart-header">
          <div>
            <h3>Your Datasets</h3>
            <span className="chart-subtitle">All generated transit datasets</span>
          </div>
          <span className="badge-pill badge-gold">CATALOG</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dataset Name</th>
                <th>Scale Tier</th>
                <th>Records</th>
                <th>Status</th>
                <th>Ingestion Date</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((d, i) => (
                <tr key={i}>
                  <td className="mono-val"><strong>{d.name}</strong></td>
                  <td><span className="badge-pill badge-aurora">{d.scale}</span></td>
                  <td className="mono-val text-cyan"><strong>{d.record_count?.toLocaleString()}</strong></td>
                  <td>
                    <span className="status-badge-chip valid">● READY</span>
                  </td>
                  <td className="mono-val text-dim">{d.created_at ? new Date(d.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
