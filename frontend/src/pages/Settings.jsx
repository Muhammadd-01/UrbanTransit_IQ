import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../api/client';
import { FaSlidersH, FaServer, FaMicrochip, FaUsers, FaDatabase, FaBolt, FaHdd, FaSave } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const [thresholds, setThresholds] = useState(null);

  useEffect(() => {
    settingsAPI.getThresholds()
      .then(res => setThresholds(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="page-container settings-page">
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>SYSTEM CONFIGURATION // ANALYTICAL THRESHOLDS</span>
          </div>
          <h1 className="hero-main-title">System Settings & Threshold Engine</h1>
          <p className="hero-desc">
            Externalized operational parameters loaded dynamically from <code>config/thresholds.yaml</code> for deterministic transit evaluation and Mac 16GB hardware constraints.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaSlidersH className="text-cyan" /> YAML SPEC: SYNCED</span>
        </div>
      </div>

      <div className="dashboard-grid-two">
        {/* Left: Configurable Thresholds */}
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Analytical Evaluation Thresholds</h3>
              <span className="chart-subtitle">Loaded from config/thresholds.yaml</span>
            </div>
            <span className="badge-pill badge-aurora">CONFIG // YAML</span>
          </div>

          {thresholds ? (
            <div className="thresholds-container">
              <div className="threshold-card hud-panel">
                <span className="tc-title text-gold">OVERCROWDING THRESHOLDS:</span>
                <div className="tc-row">
                  <span>Moderate Overcrowding:</span>
                  <strong className="mono-val text-white">{((thresholds.overcrowding?.moderate || 0.85) * 100).toFixed(0)}% Load</strong>
                </div>
                <div className="tc-row">
                  <span>Critical Overcrowding:</span>
                  <strong className="mono-val text-coral">{((thresholds.overcrowding?.overcrowded || 0.95) * 100).toFixed(0)}% Load</strong>
                </div>
              </div>

              <div className="threshold-card hud-panel">
                <span className="tc-title text-cyan">DELAY SEVERITY BANDS (MINUTES):</span>
                <div className="tc-row">
                  <span>On-Time Arrival:</span>
                  <strong className="mono-val text-success">&lt; {thresholds.delay?.on_time || 5} min</strong>
                </div>
                <div className="tc-row">
                  <span>Minor Delay:</span>
                  <strong className="mono-val text-gold">{thresholds.delay?.minor || 10} min</strong>
                </div>
                <div className="tc-row">
                  <span>Major Severe Delay:</span>
                  <strong className="mono-val text-coral">&gt; {thresholds.delay?.major || 15} min</strong>
                </div>
              </div>

              <div className="threshold-card hud-panel">
                <span className="tc-title text-sky">HEADWAY BUNCHING & GAPPING:</span>
                <div className="tc-row">
                  <span>Bunching Ratio Threshold:</span>
                  <strong className="mono-val text-coral">&lt; {thresholds.headway?.bunching_threshold_ratio || 0.5}x Scheduled</strong>
                </div>
                <div className="tc-row">
                  <span>Gap Ratio Threshold:</span>
                  <strong className="mono-val text-gold">&gt; {thresholds.headway?.gap_threshold_ratio || 1.8}x Scheduled</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="mono-val text-dim" style={{ padding: '20px' }}>Loading configuration schema...</div>
          )}
        </div>

        {/* Right: Architecture Specifications */}
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Platform & Cluster Execution Context</h3>
              <span className="chart-subtitle">Mac 16GB Single-Node Big Data Specifications</span>
            </div>
            <span className="badge-pill badge-gold">HARDWARE ALLOCATION</span>
          </div>

          <div className="platform-spec-list">
            <div className="ps-row">
              <span className="ps-label">FOCUS METROPOLIS:</span>
              <strong className="text-white">Karachi Metropolitan Area, Pakistan</strong>
            </div>
            <div className="ps-row">
              <span className="ps-label">EXECUTION PROFILE:</span>
              <span className="status-badge-chip valid">ONLINE CLUSTER (OFFLINE RESILIENT)</span>
            </div>
            <div className="ps-row">
              <span className="ps-label">APACHE SPARK RESOURCE:</span>
              <strong className="mono-val text-cyan">2GB Driver / 2GB Executor (Standalone)</strong>
            </div>
            <div className="ps-row">
              <span className="ps-label">HADOOP HDFS STORAGE:</span>
              <strong className="mono-val text-white">Replication 1 / 64MB Block Size</strong>
            </div>
            <div className="ps-row">
              <span className="ps-label">DATABASE FABRIC:</span>
              <strong className="mono-val text-gold">PostgreSQL (Supabase) with RLS Enforced</strong>
            </div>
            <div className="ps-row">
              <span className="ps-label">FASTAPI GATEWAY:</span>
              <strong className="mono-val text-white">Uvicorn Async Worker on Port 8000</strong>
            </div>
          </div>

          <div className="team-credits-box hud-panel">
            <span className="tc-header text-cyan"><FaUsers /> LEAD ARCHITECT & ENGINEERING ROSTER:</span>
            <p>
              <strong>Muhammad Affan</strong> (Lead Architect & Full-Stack Data Engineer) · 
              <strong> Muhammad Hammad</strong> (Big Data & Spark) · 
              <strong> Shahmir Qadri</strong> (Machine Learning) · 
              <strong> Waqas Rehman</strong> (Data Quality Governance)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
