import React, { useState, useEffect } from 'react';
import { pipelineAPI } from '../../api/client';
import { FaBrain, FaCheckCircle, FaExclamationTriangle, FaNetworkWired, FaServer, FaCubes } from 'react-icons/fa';
import './PipelineBanner.css';

const PipelineBanner = ({ contextMessage }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    pipelineAPI.getStatus()
      .then(res => {
        if (mounted) {
          setStatus(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch pipeline status:', err);
        if (mounted) setLoading(false);
      });
      
    return () => { mounted = false; };
  }, []);

  if (loading) return null; // Don't show anything while loading
  
  if (!status || !status.is_trained) {
    return (
      <div className="pipeline-banner untrained">
        <div className="pb-icon-col">
          <FaExclamationTriangle size={20} className="text-gold" />
        </div>
        <div className="pb-content-col">
          <div className="pb-title">AI Pipeline Intelligence (Untrained)</div>
          <div className="pb-subtitle">Execute the pipeline on the Dashboard to inject ML insights into this panel.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pipeline-banner trained">
      <div className="pb-icon-col">
        <FaBrain size={24} className="text-cyan pulse-glow" />
      </div>
      
      <div className="pb-main-col">
        <div className="pb-title">
          Trained Model Intelligence
          <span className="pb-badge"><FaCheckCircle size={10}/> Active</span>
        </div>
        <div className="pb-context">{contextMessage || "Page data is backed by ML models trained on real transit records."}</div>
        
        <div className="pb-metrics">
          <div className="pb-metric">
            <FaServer className="pb-metric-icon" />
            <span className="pb-metric-label">Records Trained:</span>
            <span className="pb-metric-val">{status.records_used.toLocaleString()}+</span>
          </div>
          <div className="pb-metric">
            <FaNetworkWired className="pb-metric-icon" />
            <span className="pb-metric-label">Spark MLlib Acc:</span>
            <span className="pb-metric-val">{status.spark_acc}%</span>
          </div>
          <div className="pb-metric">
            <FaCubes className="pb-metric-icon" />
            <span className="pb-metric-label">XGBoost Acc:</span>
            <span className="pb-metric-val">{status.xgb_acc}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineBanner;
