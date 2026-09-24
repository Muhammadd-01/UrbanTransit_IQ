import React, { useState, useEffect } from 'react';
import { clusteringAPI } from '../api/client';
import { FaMagic, FaProjectDiagram } from 'react-icons/fa';
import './Clustering.css';

const Clustering = () => {
  const [clusters, setClusters] = useState([]);
  const [silhouette, setSilhouette] = useState(0.684);

  useEffect(() => {
    clusteringAPI.getRouteClusters().then(res => {
      setClusters(res.data.clusters || []);
      setSilhouette(res.data.silhouette_score || 0.684);
    });
  }, []);

  return (
    <div className="page-container clustering-page">
      <div className="dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Unsupervised Route & Commuter Clustering</h1>
          <p className="page-desc">
            K-Means unsupervised partition grouping Karachi transit lines into behavioral operating clusters by load, velocity, and stop density.
          </p>
        </div>
        <div className="kpi-card" style={{ padding: '12px 22px', borderTop: '3px solid var(--accent-aurora)' }}>
          <div className="kpi-header">SILHOUETTE SCORE</div>
          <div className="kpi-value" style={{ color: 'var(--accent-aurora)', fontSize: '1.6rem', margin: '4px 0' }}>{silhouette}</div>
          <div className="kpi-trend">Well-Separated Clusters</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
        {clusters.map((c, i) => (
          <div key={i} className="chart-card">
            <span className={`badge-pill ${i % 2 === 0 ? 'badge-violet' : 'badge-gold'}`}>
              Cluster Group #{i + 1}
            </span>
            <h3 style={{ marginTop: '12px', marginBottom: '8px', color: 'var(--text-primary)' }}>{c.name}</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.45' }}>
              {c.description}
            </p>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.65)', padding: '14px 16px', borderRadius: 'var(--radius-ios-sm)', fontSize: '0.84rem', marginBottom: '16px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <div style={{ color: 'var(--accent-gold)', fontWeight: '800', marginBottom: '6px', fontSize: '0.74rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                CENTROID COORDINATES:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Avg Daily Demand:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{c.centroid?.avg_demand?.toLocaleString()} Pax</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Avg Occupancy:</span>
                <strong style={{ color: 'var(--accent-aurora)' }}>{(c.centroid?.avg_occupancy * 100).toFixed(0)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Punctuality:</span>
                <strong style={{ color: 'var(--accent-gold)' }}>{c.centroid?.punctuality}%</strong>
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '0.74rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                MEMBER CORRIDORS:
              </strong>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {c.members?.map((m, idx) => (
                  <span 
                    key={idx} 
                    style={{ 
                      background: 'rgba(241, 245, 249, 0.8)', 
                      padding: '4px 10px', 
                      borderRadius: 'var(--radius-ios-pill)', 
                      fontSize: '0.76rem', 
                      fontWeight: '700',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clustering;
