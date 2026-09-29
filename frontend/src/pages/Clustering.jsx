import React, { useState, useContext, useEffect } from 'react';
import { FilterContext } from '../contexts/FilterContext';
import { clusteringAPI } from '../api/client';
import { FaMagic, FaProjectDiagram, FaCheckCircle, FaRoute } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './Clustering.css';
import PipelineBanner from '../components/common/PipelineBanner';
import ScrollAnimate from '../hooks/useScrollAnimate';

const Clustering = () => {
  const { getFilterParams, filters } = useContext(FilterContext);

  const [clusters, setClusters] = useState([]);
  const [silhouette, setSilhouette] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clusteringAPI.getRouteClusters(getFilterParams())
      .then(res => {
        if (res.data?.clusters?.length) {
          setClusters(res.data.clusters);
        }
        if (res.data?.silhouette_score) {
          setSilhouette(res.data.silhouette_score);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container clustering-page">
      <PipelineBanner contextMessage="Train the AI to automatically group similar routes together, helping identify which routes need more buses or schedule changes." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>ROUTE GROUPING — SIMILAR ROUTES CLUSTERED TOGETHER</span>
          </div>
          <h1 className="hero-main-title">Route Grouping</h1>
          <p className="hero-desc">
            The AI automatically groups Karachi's 110 bus routes into categories based on how busy they are, how many passengers they carry, and how reliable their schedules are.
          </p>
        </div>
        <div className="hero-right-actions">
          <div className="sys-badge">
            <span className="mono-val text-cyan">GROUP QUALITY: {silhouette}</span>
          </div>
        </div>
      </div>

      {/* Cluster Grid */}
      <div className="clusters-grid">
        {loading && <div style={{padding: '20px'}}>Finding route groups...</div>}
        {!loading && clusters.length === 0 && (
          <div style={{padding: '20px', color: '#64748B'}}>No route groups found.</div>
        )}
        {!loading && clusters.map((c, i) => (
          <div key={i} className="chart-card hud-panel hud-corners cluster-card">
            <div className="cluster-card-top">
              <span className="badge-pill badge-aurora">
                ROUTE GROUP #{i + 1}
              </span>
              <span className="cluster-k-tag mono-val text-dim">{clusters.length} Groups</span>
            </div>

            <h3 className="cluster-title">{c.name}</h3>
            <p className="cluster-desc">{c.description}</p>
            
            <div className="cluster-centroid-box">
              <span className="ccb-label">GROUP AVERAGES:</span>
              <div className="ccb-row">
                <span className="ccb-stat-name">Avg Daily Passengers:</span>
                <strong className="mono-val">{c.centroid?.avg_demand?.toLocaleString() || 0} Pax</strong>
              </div>
              <div className="ccb-row">
                <span className="ccb-stat-name">Avg Occupancy:</span>
                <strong className="mono-val text-cyan">{c.centroid?.avg_occupancy != null ? (c.centroid.avg_occupancy * 100).toFixed(0) : 0}%</strong>
              </div>
              <div className="ccb-row">
                <span className="ccb-stat-name">Punctuality Score:</span>
                <strong className="mono-val text-gold">{c.centroid?.punctuality || 0}%</strong>
              </div>
            </div>

            <div className="cluster-members-section">
              <span className="members-title">ROUTES IN THIS GROUP:</span>
              <div className="members-pill-wrap">
                {c.members?.map((m, idx) => (
                  <span key={idx} className="member-corridor-pill">
                    <FaRoute className="text-cyan" /> {m}
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
