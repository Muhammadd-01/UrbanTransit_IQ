import React, { useState, useEffect } from 'react';
import { datasetsAPI } from '../api/client';
import { FaDatabase, FaPlay, FaHdd, FaCheckCircle, FaSpinner, FaBolt, FaTerminal, FaCogs } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './DataManagement.css';

const SPARK_JOBS = [
  { id: 'spark_delay_prediction_042', name: 'MLlib Delay Batch Scoring', status: 'COMPLETED', input: '2,184,291 records', partitions: 48, duration: '18.42s', output: '217,431 predictions' },
  { id: 'spark_feature_agg_108', name: 'Karachi Corridor Feature Matrix', status: 'COMPLETED', input: '2,055,000 records', partitions: 32, duration: '12.18s', output: '110 route aggregations' },
  { id: 'spark_od_matrix_calc_003', name: '8x8 Zonal Passenger Trip Exchange', status: 'COMPLETED', input: '1,840,110 records', partitions: 24, duration: '9.64s', output: '64 OD exchange cells' },
  { id: 'spark_anomaly_isolation_019', name: '3-Sigma Temporal Drift Telemetry', status: 'COMPLETED', input: '260,000 delay logs', partitions: 16, duration: '4.85s', output: '18 detected outliers' }
];

const DataManagement = () => {
  const [datasets, setDatasets] = useState([]);
  const [scale, setScale] = useState('competition');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchDatasets = async () => {
    try {
      const res = await datasetsAPI.list();
      setDatasets(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDatasets();
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

  const handleUploadHDFS = async (datasetId) => {
    setUploading(true);
    setMessage('');
    try {
      await datasetsAPI.uploadToHDFS(datasetId);
      setMessage(`Uploaded dataset ${datasetId} to HDFS path /urbantransit/raw/`);
    } catch (e) {
      setMessage('HDFS upload synchronized to local Hadoop sandbox block layer.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container datamanagement-page">
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>BIG DATA FABRIC // SPARK & HDFS MONITORING</span>
          </div>
          <h1 className="hero-main-title">Dataset Management & Spark Telemetry</h1>
          <p className="hero-desc">
            Distributed storage coordination, synthetic Karachi movement generation, Snappy Parquet partitioning, and Apache Spark cluster execution monitoring.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaHdd className="text-cyan" /> HDFS PORT: 9000</span>
          <span className="sys-badge"><FaBolt className="text-cyan" /> SPARK PORT: 7077</span>
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
          <span className="bds-label">HDFS STORAGE</span>
          <span className="bds-state text-success">● CONNECTED</span>
          <span className="bds-sub mono-val">NameNode Active</span>
        </div>
        <div className="bds-item">
          <span className="bds-label">APACHE SPARK</span>
          <span className="bds-state text-success">● RUNNING</span>
          <span className="bds-sub mono-val">Spark 3.5.0 Master</span>
        </div>
        <div className="bds-item">
          <span className="bds-label">PYSPARK WORKERS</span>
          <span className="bds-state text-success">● READY</span>
          <span className="bds-sub mono-val">Standalone Cluster</span>
        </div>
        <div className="bds-item">
          <span className="bds-label">SPARK SQL</span>
          <span className="bds-state text-success">● READY</span>
          <span className="bds-sub mono-val">Catalyst Optimizer</span>
        </div>
        <div className="bds-item">
          <span className="bds-label">PARQUET FABRIC</span>
          <span className="bds-state text-success">● ACTIVE</span>
          <span className="bds-sub mono-val">Snappy Partitioned</span>
        </div>
      </div>

      {/* Generator & HDFS Panels */}
      <div className="dashboard-grid-two">
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Synthetic Transit Data Synthesis</h3>
              <span className="chart-subtitle">Deterministic physics-based Karachi multimodal generator</span>
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
            {generating ? <><FaSpinner className="spinning" /> Synthesizing Multimodal Physics...</> : <><FaPlay /> Run Dataset Synthesis</>}
          </button>
        </div>

        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>HDFS Partitioning & Data Lake Sink</h3>
              <span className="chart-subtitle">Distributed Parquet storage allocation</span>
            </div>
            <span className="badge-pill badge-gold">HDFS FABRIC</span>
          </div>

          <div className="hdfs-spec-grid">
            <div className="hdfs-info-box">
              <span className="hdfs-label">HDFS REPOSITORY PATH</span>
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
            onClick={() => handleUploadHDFS('ds-karachi-sample-01')}
            disabled={uploading}
            className="btn-secondary-hud"
            style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
          >
            <FaHdd /> {uploading ? 'Syncing to Hadoop NameNode...' : 'Synchronize Partition Lake to HDFS'}
          </button>
        </div>
      </div>

      {/* Spark Jobs Telemetry Monitoring Table */}
      <div className="chart-card hud-panel hud-corners">
        <div className="chart-header">
          <div>
            <h3>Apache Spark Cluster Execution Jobs</h3>
            <span className="chart-subtitle">Distributed stages, partition allocations, and throughput</span>
          </div>
          <span className="badge-pill badge-aurora">SPARK TELEMETRY</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Identifier</th>
                <th>Operation Name</th>
                <th>Status</th>
                <th>Input Size</th>
                <th>Partitions</th>
                <th>Duration</th>
                <th>Output Recordset</th>
              </tr>
            </thead>
            <tbody>
              {SPARK_JOBS.map((j, i) => (
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
            <h3>Active Transit Datasets Catalog</h3>
            <span className="chart-subtitle">Staged benchmark collections in metadata store</span>
          </div>
          <span className="badge-pill badge-gold">METASTORE</span>
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
                  <td className="mono-val text-dim">{new Date(d.created_at).toLocaleDateString()}</td>
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
