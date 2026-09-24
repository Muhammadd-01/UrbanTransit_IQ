import React, { useState, useEffect } from 'react';
import { datasetsAPI } from '../api/client';
import { FaDatabase, FaPlay, FaHdd, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import './DataManagement.css';

const DataManagement = () => {
  const [datasets, setDatasets] = useState([]);
  const [scale, setScale] = useState('small');
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
      setMessage('HDFS upload failed. Ensure Hadoop NameNode is reachable on port 9000.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container datamanagement-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Dataset & Big Data HDFS Fabric</h1>
          <p className="page-desc">
            Multi-scale synthetic generator (Karachi transit topology), Hadoop HDFS synchronization, and partitioned Parquet data lake ingestion.
          </p>
        </div>
      </div>

      {message && (
        <div className="liquid-alert-success fade-in-up" style={{ marginBottom: '20px' }}>
          <FaCheckCircle /> {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <FaDatabase style={{ color: 'var(--accent-aurora)' }} />
            <h3>Generate Synthetic Transit Data</h3>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              SCALE PROFILE
            </label>
            <select 
              value={scale} 
              onChange={(e) => setScale(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="small">Small (~50,000 movements, 20 routes, 3 months)</option>
              <option value="medium">Medium (~500,000 movements, 50 routes, 6 months)</option>
              <option value="competition">Competition (2,000,000+ movements, 110 routes, 12 months)</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="btn-aurora"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {generating ? <><FaSpinner className="spinning" /> Synthesizing Movement Physics...</> : <><FaPlay /> Generate Dataset</>}
          </button>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <FaHdd style={{ color: 'var(--accent-gold)' }} />
            <h3>HDFS Ingestion & Parquet Partitioning</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="hdfs-box">
              <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>HDFS TARGET PATH</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>/urbantransit/raw/</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-aurora)', fontWeight: '600' }}>Replication: 1 (Mac 16GB)</div>
            </div>
            <div className="hdfs-box">
              <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>PARTITION FORMAT</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>Snappy Parquet</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-gold)', fontWeight: '600' }}>by(year, month, route_id)</div>
            </div>
          </div>

          <button
            onClick={() => handleUploadHDFS('ds-karachi-sample-01')}
            disabled={uploading}
            className="btn-ghost-glass"
            style={{ marginTop: '18px', width: '100%', justifyContent: 'center' }}
          >
            <FaHdd /> {uploading ? 'Syncing to Hadoop HDFS...' : 'Synchronize Raw Data to HDFS'}
          </button>
        </div>
      </div>

      <div className="chart-card">
        <h3 style={{ marginBottom: '16px' }}>Active Transit Datasets</h3>
        <div className="table-container" style={{ border: 'none', background: 'transparent', padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Dataset Name</th>
                <th>Scale</th>
                <th>Records</th>
                <th>Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((d, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{d.name}</td>
                  <td><span className="badge-pill badge-aurora">{d.scale}</span></td>
                  <td style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>{d.record_count?.toLocaleString()}</td>
                  <td>
                    <span style={{ color: 'var(--accent-aurora)', fontWeight: '800', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span className="pulse-dot"></span> READY
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(d.created_at).toLocaleDateString()}</td>
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
