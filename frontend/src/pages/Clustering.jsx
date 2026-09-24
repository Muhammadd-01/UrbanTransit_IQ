import React, { useState, useEffect } from 'react';
import { clusteringAPI } from '../api/client';
import { FaMagic, FaProjectDiagram, FaCheckCircle, FaRoute } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './Clustering.css';

const DEFAULT_CLUSTERS = [
  {
    name: 'High-Density Trunk Super-Corridors',
    description: 'High passenger capacity corridors connecting residential peripheries with the commercial central business district.',
    centroid: { avg_demand: 48200, avg_occupancy: 0.92, punctuality: 82.4 },
    members: ['PB-01', 'GL-01', 'PB-02', 'PB-03']
  },
  {
    name: 'Industrial Commuter & Port Connectors',
    description: 'Medium-frequency routes servicing shift workers traveling between Korangi Industrial, Landhi, and SITE.',
    centroid: { avg_demand: 34100, avg_occupancy: 0.84, punctuality: 86.8 },
    members: ['PB-08', 'PB-09', 'LB-04', 'LB-05']
  },
  {
    name: 'Coastal & Suburb Feeder Network',
    description: 'Longer distance, low-frequency feeder branches servicing coastal communities and outlying university clusters.',
    centroid: { avg_demand: 18400, avg_occupancy: 0.68, punctuality: 91.2 },
    members: ['LB-14', 'LB-15', 'FD-01', 'FD-02']
  }
];

const Clustering = () => {
  const [clusters, setClusters] = useState(DEFAULT_CLUSTERS);
  const [silhouette, setSilhouette] = useState(0.684);

  useEffect(() => {
    clusteringAPI.getRouteClusters()
      .then(res => {
        if (res.data?.clusters?.length) {
          setClusters(res.data.clusters);
        }
        if (res.data?.silhouette_score) {
          setSilhouette(res.data.silhouette_score);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="page-container clustering-page">
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>UNSUPERVISED MACHINE LEARNING // K-MEANS PARTITIONING</span>
          </div>
          <h1 className="hero-main-title">Route & Commuter Clustering</h1>
          <p className="hero-desc">
            K-Means algorithm partitioning Karachi's 110 transit lines into behavioral operating archetypes evaluated on load factor, passenger volume, and schedule reliability.
          </p>
        </div>
        <div className="hero-right-actions">
          <div className="sys-badge">
            <span className="mono-val text-cyan">SILHOUETTE: {silhouette}</span>
          </div>
        </div>
      </div>

      {/* Cluster Grid */}
      <div className="clusters-grid">
        {clusters.map((c, i) => (
          <div key={i} className="chart-card hud-panel hud-corners cluster-card">
            <div className="cluster-card-top">
              <span className="badge-pill badge-aurora">
                CLUSTER GROUP #{i + 1}
              </span>
              <span className="cluster-k-tag mono-val text-dim">K = 3</span>
            </div>

            <h3 className="cluster-title">{c.name}</h3>
            <p className="cluster-desc">{c.description}</p>
            
            <div className="cluster-centroid-box">
              <span className="ccb-label">CENTROID COORDINATES:</span>
              <div className="ccb-row">
                <span className="ccb-stat-name">Avg Daily Demand:</span>
                <strong className="mono-val">{c.centroid?.avg_demand?.toLocaleString()} Pax</strong>
              </div>
              <div className="ccb-row">
                <span className="ccb-stat-name">Avg Occupancy:</span>
                <strong className="mono-val text-cyan">{(c.centroid?.avg_occupancy * 100).toFixed(0)}%</strong>
              </div>
              <div className="ccb-row">
                <span className="ccb-stat-name">Punctuality Score:</span>
                <strong className="mono-val text-gold">{c.centroid?.punctuality}%</strong>
              </div>
            </div>

            <div className="cluster-members-section">
              <span className="members-title">MEMBER CORRIDORS:</span>
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
