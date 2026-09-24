import React, { useState, useEffect } from 'react';
import { qualityAPI } from '../api/client';
import Plot from 'react-plotly.js';
import { FaCheckCircle, FaExclamationTriangle, FaFilter, FaShieldAlt } from 'react-icons/fa';
import './DataQuality.css';

const DataQuality = () => {
  const [report, setReport] = useState(null);
  const [auditList, setAuditList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    qualityAPI.getReport('ds-karachi-sample-01').then(res => setReport(res.data));
    qualityAPI.getAudit('ds-karachi-sample-01').then(res => setAuditList(res.data));
  }, []);

  const filteredAudit = statusFilter === 'ALL' 
    ? auditList 
    : auditList.filter(a => a.status === statusFilter);

  return (
    <div className="page-container dataquality-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">4-Tier Data Quality & Audit Engine</h1>
          <p className="page-desc">
            Record-level automated audit ledger categorizing Karachi transit telemetry into VALID, CORRECTED, FLAGGED, and QUARANTINED states.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-aurora)' }}>
          <div className="kpi-header">VALID RECORDS</div>
          <div className="kpi-value" style={{ color: 'var(--accent-aurora)' }}>98.4%</div>
          <div className="kpi-trend">1,948,200 Clean Rows</div>
        </div>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-gold)' }}>
          <div className="kpi-header">CORRECTED (IMPUTED)</div>
          <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>0.6%</div>
          <div className="kpi-trend">Negative counts clamped</div>
        </div>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-violet)' }}>
          <div className="kpi-header">FLAGGED ANOMALIES</div>
          <div className="kpi-value" style={{ color: 'var(--accent-violet)' }}>0.7%</div>
          <div className="kpi-trend">&gt;3.0 z-score delays</div>
        </div>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-coral)' }}>
          <div className="kpi-header">QUARANTINED</div>
          <div className="kpi-value" style={{ color: 'var(--accent-coral)' }}>0.3%</div>
          <div className="kpi-trend">Corrupt PKs isolated</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="chart-card">
          <h3>Quality Dimensions Breakdown</h3>
          <Plot
            data={[{
              x: ['Completeness', 'Consistency', 'Validity', 'Overall Quality'],
              y: [98.4, 99.1, 97.4, 98.3],
              type: 'bar',
              marker: { 
                color: ['#00e599', '#f59e0b', '#a855f7', '#10b981'],
                line: { color: 'rgba(255, 255, 255, 0.2)', width: 1 }
              }
            }]}
            layout={{
              height: 280,
              margin: { l: 40, r: 20, t: 20, b: 40 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              font: { color: '#334155', family: 'Plus Jakarta Sans, sans-serif' },
              yaxis: { range: [80, 100], gridcolor: 'rgba(0, 0, 0, 0.06)' },
              xaxis: { gridcolor: 'transparent' }
            }}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler={true}
            style={{ width: '100%' }}
          />
        </div>

        <div className="chart-card">
          <h3>Issue Distribution by Type</h3>
          <Plot
            data={[{
              labels: ['Missing Values', 'Duplicate Taps', 'Delay Outliers', 'Negative Counts', 'Broken Refs'],
              values: [42, 24, 18, 11, 5],
              type: 'pie',
              hole: 0.5,
              marker: { 
                colors: ['#d97706', '#64748b', '#e11d48', '#7c3aed', '#059669'],
                line: { color: '#ffffff', width: 2 }
              }
            }]}
            layout={{
              height: 280,
              margin: { l: 20, r: 20, t: 20, b: 20 },
              paper_bgcolor: 'transparent',
              font: { color: '#0f172a', family: 'Plus Jakarta Sans, sans-serif' },
              showlegend: true,
              legend: { orientation: 'h', y: -0.1, font: { color: '#334155' } }
            }}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler={true}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>Record-Level Audit Ledger</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              Live ingestion partition scan with cleaning transform provenance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'VALID', 'CORRECTED', 'FLAGGED', 'QUARANTINED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`filter-chip-btn ${statusFilter === status ? 'active' : ''}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', background: 'transparent', padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Affected Column</th>
                <th>Original Value</th>
                <th>Remediation Rule</th>
                <th>Cleaned Value</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAudit.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{a.record_id}</td>
                  <td><code>{a.affected_column}</code></td>
                  <td style={{ color: 'var(--accent-coral)', fontWeight: '600' }}>{a.original_value}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.cleaning_rule}</td>
                  <td style={{ color: 'var(--accent-aurora)', fontWeight: '700' }}>{a.corrected_value}</td>
                  <td>
                    <span className={`status-badge ${a.status}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataQuality;
