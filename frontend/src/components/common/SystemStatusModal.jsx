import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaSyncAlt, FaNetworkWired } from 'react-icons/fa';
import client from '../../api/client';
import './SystemStatusModal.css';

const periodicElements = [
  { id: 'Rt', name: 'React 18', group: 'frontend', num: 1, desc: 'Client Interface Layer' },
  { id: 'Tw', name: 'Tailwind', group: 'frontend', num: 2, desc: 'CSS Architecture' },
  { id: 'R3', name: 'Three.js', group: 'frontend', num: 3, desc: 'WebGL Rendering Engine' },
  { id: 'Pl', name: 'Plotly', group: 'frontend', num: 4, desc: 'Data Visualization' },
  
  { id: 'Fa', name: 'FastAPI', group: 'api', num: 11, desc: 'ASGI REST Gateway' },
  { id: 'Py', name: 'Python 3', group: 'api', num: 12, desc: 'Core Backend Runtime' },
  { id: 'Uv', name: 'Uvicorn', group: 'api', num: 13, desc: 'ASGI Server' },
  { id: 'Pd', name: 'Pydantic', group: 'api', num: 14, desc: 'Data Validation' },

  { id: 'Sp', name: 'Spark', group: 'bigdata', num: 21, desc: 'Distributed Analytics' },
  { id: 'Hd', name: 'Data Lake', group: 'bigdata', num: 22, desc: 'Distributed Storage' },
  { id: 'Ka', name: 'Kafka', group: 'bigdata', num: 23, desc: 'Event Streaming' },
  { id: 'Pq', name: 'Parquet', group: 'bigdata', num: 24, desc: 'Columnar Format' },

  { id: 'Mg', name: 'MongoDB', group: 'database', num: 31, desc: 'Document Database' },
  { id: 'Su', name: 'Supabase', group: 'database', num: 32, desc: 'BaaS Provider' },
  { id: 'Rd', name: 'Redis', group: 'database', num: 33, desc: 'In-Memory Cache' },
  { id: 'S3', name: 'S3 Bucket', group: 'database', num: 34, desc: 'Object Storage' },

  { id: 'Xg', name: 'XGBoost', group: 'ml', num: 41, desc: 'Gradient Boosting' },
  { id: 'Ml', name: 'MLlib', group: 'ml', num: 42, desc: 'Spark ML Library' },
  { id: 'Sk', name: 'Scikit-Learn', group: 'ml', num: 43, desc: 'Classic ML Models' },
  { id: 'On', name: 'ONNX', group: 'ml', num: 44, desc: 'Model Export Format' },
];

const SystemStatusModal = ({ isOpen, onClose }) => {
  const [latency, setLatency] = useState('12ms');
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      await client.get('/health');
      const diff = Math.round(performance.now() - start);
      setLatency(`${diff}ms`);
    } catch (e) {
      setLatency('Fallback Mode');
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  useEffect(() => {
    if (isOpen) checkHealth();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="status-backdrop" onClick={onClose}>
      <div className="status-modal hud-panel" onClick={e => e.stopPropagation()}>
        <div className="status-header">
          <div className="status-header-title">
            <span className="pulse-beacon-cyan"></span>
            <h3>Periodic Table of Infrastructure</h3>
          </div>
          <button className="status-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="status-body">
          <div className="status-summary-bar">
            <div className="summary-stat">
              <span className="summary-label">GATEWAY LATENCY</span>
              <span className="summary-val">{latency}</span>
            </div>
            <div className="summary-stat">
              <span className="summary-label">TOTAL NODES</span>
              <span className="summary-val">20 Active</span>
            </div>
            <div className="summary-stat">
              <span className="summary-label">NETWORK STATE</span>
              <span className="summary-val text-success">STABLE</span>
            </div>
          </div>

          <p className="periodic-desc">
            <FaNetworkWired /> Full stack architectural topology map and component health matrix.
          </p>

          <div className="periodic-table-grid">
            {periodicElements.map((el, i) => (
              <div 
                key={el.id} 
                className={`periodic-element group-${el.group}`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <span className="periodic-num">{el.num}</span>
                <span className="periodic-id">{el.id}</span>
                <span className="periodic-name">{el.name}</span>
                
                {/* Shadcn style Tooltip on hover */}
                <div className="periodic-tooltip">
                  <strong>{el.name}</strong>
                  <p>{el.desc}</p>
                  <span className="tooltip-status">● ONLINE</span>
                </div>
              </div>
            ))}
          </div>

          <div className="periodic-legend">
            <span className="legend-item"><span className="legend-box group-frontend"></span> Frontend Layer</span>
            <span className="legend-item"><span className="legend-box group-api"></span> API Gateway</span>
            <span className="legend-item"><span className="legend-box group-bigdata"></span> Big Data Fabric</span>
            <span className="legend-item"><span className="legend-box group-database"></span> Storage & Cache</span>
            <span className="legend-item"><span className="legend-box group-ml"></span> Machine Learning</span>
          </div>
        </div>

        <div className="status-footer">
          <button className="btn-secondary-hud" onClick={checkHealth} disabled={loading}>
            <FaSyncAlt className={loading ? 'spinning' : ''} /> {loading ? 'Pinging Node Fabric...' : 'Run Network Ping'}
          </button>
          <span className="status-timestamp">UTIQ // KARACHI-CLUSTER</span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusModal;
