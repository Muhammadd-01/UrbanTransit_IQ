import React, { useState, useEffect, useContext } from 'react';
import { pipelineAPI } from '../../api/client';
import { AuthContext } from '../../contexts/AuthContext';
import { FaBrain, FaCheckCircle, FaExclamationTriangle, FaNetworkWired, FaServer, FaCubes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './PipelineBanner.css';

const PipelineBanner = ({ contextMessage }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState('spark'); // 'spark' or 'xgb'

  useEffect(() => {
    let mounted = true;
    pipelineAPI.getStatus()
      .then(res => {
        if (mounted) {
          setStatus(res.data);
          setLoading(false);
          // Auto-select the trained model
          if (res.data?.spark_is_trained && !res.data?.xgb_is_trained) {
            setActiveModel('spark');
          } else if (res.data?.xgb_is_trained && !res.data?.spark_is_trained) {
            setActiveModel('xgb');
          }
        }
      })
      .catch(err => {
        console.error('Failed to fetch pipeline status:', err);
        if (mounted) setLoading(false);
      });
      
    return () => { mounted = false; };
  }, []);

  if (loading) return null;
  
  if (!status || !status.is_trained) {
    return (
      <div className="pipeline-banner untrained">
        <div className="pb-icon-col">
          <FaExclamationTriangle size={20} className="text-gold" />
        </div>
        <div className="pb-content-col">
          <div className="pb-title">AI Pipeline Intelligence (Untrained)</div>
          <div className="pb-subtitle">
            {isAdmin 
              ? 'Execute the pipeline on the Dashboard to inject ML insights into this panel.'
              : 'Awaiting administrator to train models on the Dashboard to inject ML insights into this panel.'}
          </div>
        </div>
      </div>
    );
  }

  const sparkTrained = status.spark_is_trained;
  const xgbTrained = status.xgb_is_trained;
  const bothTrained = sparkTrained && xgbTrained;

  // Pick metrics based on active model
  const acc = activeModel === 'spark' ? status.spark_acc : status.xgb_acc;
  const mae = activeModel === 'spark' ? status.spark_mae : status.xgb_mae;
  const rmse = activeModel === 'spark' ? status.spark_rmse : status.xgb_rmse;
  const r2 = activeModel === 'spark' ? status.spark_r2 : status.xgb_r2;
  const modelLabel = activeModel === 'spark' ? 'Spark MLlib (Random Forest)' : 'XGBoost (Gradient Boosted Trees)';

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
        
        {/* Model Switcher — only if both trained */}
        {bothTrained && (
          <div className="pb-model-switcher" style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveModel('spark')}
              style={{
                padding: '3px 10px', borderRadius: '12px', border: 'none', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer',
                background: activeModel === 'spark' ? 'linear-gradient(135deg, #0ea5e9, #06b6d4)' : '#e2e8f0',
                color: activeModel === 'spark' ? '#fff' : '#64748b'
              }}
            >
              Spark MLlib
            </button>
            <button
              onClick={() => setActiveModel('xgb')}
              style={{
                padding: '3px 10px', borderRadius: '12px', border: 'none', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer',
                background: activeModel === 'xgb' ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' : '#e2e8f0',
                color: activeModel === 'xgb' ? '#fff' : '#64748b'
              }}
            >
              XGBoost
            </button>
          </div>
        )}

        <div className="pb-metrics">
          <div className="pb-metric">
            <FaServer className="pb-metric-icon" />
            <span className="pb-metric-label">Records:</span>
            <span className="pb-metric-val">{status.records_used?.toLocaleString()}+</span>
          </div>
          <div className="pb-metric">
            <FaNetworkWired className="pb-metric-icon" />
            <span className="pb-metric-label">{activeModel === 'spark' ? 'Spark' : 'XGBoost'} Acc:</span>
            <span className="pb-metric-val">{acc}%</span>
          </div>
          <div className="pb-metric">
            <FaCubes className="pb-metric-icon" />
            <span className="pb-metric-label">MAE:</span>
            <span className="pb-metric-val">{mae}</span>
          </div>
          <div className="pb-metric">
            <FaCubes className="pb-metric-icon" />
            <span className="pb-metric-label">RMSE:</span>
            <span className="pb-metric-val">{rmse}</span>
          </div>
          <div className="pb-metric">
            <FaCubes className="pb-metric-icon" />
            <span className="pb-metric-label">R²:</span>
            <span className="pb-metric-val">{r2}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineBanner;
