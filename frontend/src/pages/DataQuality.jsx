import React, { useState, useContext, useEffect } from 'react';
import { FilterContext } from '../contexts/FilterContext';
import { qualityAPI } from '../api/client';
import Plot from 'react-plotly.js';
import { FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaArrowRight, FaDatabase, FaFilter } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import { getPlotlyLayout, defaultPlotlyConfig } from '../utils/plotlyTheme';
import './DataQuality.css';
import PipelineBanner from '../components/common/PipelineBanner';

const DataQuality = () => {
  const { getFilterParams, filters } = useContext(FilterContext);

  const [report, setReport] = useState(null);
  const [auditList, setAuditList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    qualityAPI.getReport('ds-karachi-sample-01').then(res => setReport(res.data)).catch(console.error);
    qualityAPI.getAudit('ds-karachi-sample-01').then(res => setAuditList(res.data)).catch(console.error);
  }, [filters]);

  const filteredAudit = auditList.filter(a => {
    const finalStatus = a.final_status || a.status;
    const matchesStatus = statusFilter === 'ALL' || finalStatus === statusFilter;
    const matchesSearch = !searchQuery || 
      a.record_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.issue_type || a.affected_column || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cleaning_rule?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="page-container dataquality-page">
      <PipelineBanner contextMessage="Ensuring every record is clean and reliable before training your AI models." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>DATA QUALITY — ENSURING CLEAN & RELIABLE DATA</span>
          </div>
          <h1 className="hero-main-title">Data Quality Dashboard</h1>
          <p className="hero-desc">
            Automatically checks every record in your dataset for errors, fixes what it can, and flags anything suspicious. Clean data = better AI predictions.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaShieldAlt className="text-cyan" /> 15 QUALITY CHECKS</span>
          <span className="sys-badge"><FaDatabase className="text-cyan" /> 2,055,000 RECORDS CHECKED</span>
        </div>
      </div>

      {/* Visual Pipeline Flow Sequence */}
      <div className="pipeline-flow-panel hud-panel hud-corners">
        <div className="pipeline-header">
          <span className="tech-tag-sm">DATA CLEANING PIPELINE</span>
          <span className="pipeline-meta">AUTOMATED QUALITY STEPS</span>
        </div>
        <div className="pipeline-steps">
          <div className="pipeline-step">
            <div className="step-tag">STAGE 01</div>
            <div className="step-title">RAW DATA</div>
            <div className="step-metric mono-val">2,055,000 Rows</div>
            <div className="step-status text-cyan">Loaded from database</div>
          </div>
          <div className="pipeline-arrow"><FaArrowRight /></div>

          <div className="pipeline-step">
            <div className="step-tag">STAGE 02</div>
            <div className="step-title">QUALITY CHECKS</div>
            <div className="step-metric mono-val">15 Rules Applied</div>
            <div className="step-status text-success">IDs, References, Formats</div>
          </div>
          <div className="pipeline-arrow"><FaArrowRight /></div>

          <div className="pipeline-step">
            <div className="step-tag">STAGE 03</div>
            <div className="step-title">OUTLIER DETECTION</div>
            <div className="step-metric mono-val">Statistical checks</div>
            <div className="step-status text-warning">Unusual values</div>
          </div>
          <div className="pipeline-arrow"><FaArrowRight /></div>

          <div className="pipeline-step">
            <div className="step-tag">STAGE 04</div>
            <div className="step-title">AUTO-FIX</div>
            <div className="step-metric mono-val">12,400 Fixed</div>
            <div className="step-status text-cyan">Replaced with typical values</div>
          </div>
          <div className="pipeline-arrow"><FaArrowRight /></div>

          <div className="pipeline-step">
            <div className="step-tag">STAGE 05</div>
            <div className="step-title">QUARANTINE</div>
            <div className="step-metric mono-val">6,160 Removed</div>
            <div className="step-status text-coral">Excluded from training</div>
          </div>
          <div className="pipeline-arrow"><FaArrowRight /></div>

          <div className="pipeline-step active-final">
            <div className="step-tag">STAGE 06</div>
            <div className="step-title">CLEAN DATA</div>
            <div className="step-metric mono-val">2,036,440 Ready</div>
            <div className="step-status text-success">99.1% Clean</div>
          </div>
        </div>
      </div>

      {/* 4-Tier Governance Cards */}
      <div className="kpi-grid-four">
        <KPICard 
          title="CLEAN RECORDS"
          value={report?.valid != null ? `${((report.valid / (report.total_records || 1)) * 100).toFixed(1)}%` : (report?.valid_percentage ? `${report.valid_percentage}%` : 'N/A')}
          techCode="Clean"
          change="0.2"
          changeDirection="up"
          subtitle="Passed all 15 quality checks"
          progress={report?.valid != null ? (report.valid / (report.total_records || 1)) * 100 : (report?.valid_percentage || 0)}
          colorScheme="cyan"
          icon={<FaCheckCircle />}
        />
        <KPICard 
          title="AUTO-FIXED RECORDS"
          value={report?.corrected != null ? `${((report.corrected / (report.total_records || 1)) * 100).toFixed(1)}%` : (report?.corrected_percentage ? `${report.corrected_percentage}%` : '0.6%')}
          techCode="Fixed"
          change="0.1"
          changeDirection="down"
          subtitle="Had minor errors that were automatically corrected"
          progress={report?.corrected != null ? (report.corrected / (report.total_records || 1)) * 100 : (report?.corrected_percentage || 0.6)}
          colorScheme="gold"
          icon={<FaShieldAlt />}
        />
        <KPICard 
          title="FLAGGED RECORDS"
          value={report?.invalid != null ? `${((report.invalid / (report.total_records || 1)) * 100).toFixed(1)}%` : (report?.flagged_percentage ? `${report.flagged_percentage}%` : 'N/A')}
          techCode="Flagged"
          change="0.2"
          changeDirection="down"
          subtitle="Kept in dataset but marked for review"
          progress={report?.invalid != null ? (report.invalid / (report.total_records || 1)) * 100 : (report?.flagged_percentage || 0)}
          colorScheme="sky"
          icon={<FaExclamationTriangle />}
        />
        <KPICard 
          title="REMOVED RECORDS"
          value={report?.missing != null ? `${((report.missing / (report.total_records || 1)) * 100).toFixed(1)}%` : (report?.quarantined_percentage ? `${report.quarantined_percentage}%` : 'N/A')}
          techCode="Removed"
          change="0.05"
          changeDirection="down"
          subtitle="Too unreliable — excluded from AI training"
          progress={report?.missing != null ? (report.missing / (report.total_records || 1)) * 100 : (report?.quarantined_percentage || 0)}
          colorScheme="coral"
          icon={<FaExclamationTriangle />}
        />
      </div>

      {/* 7 Issue Breakdown Micro-Metrics */}
      <div className="quality-breakdown-strip hud-panel">
        <div className="qb-item">
          <span className="qb-label">TOTAL RECORDS</span>
          <span className="qb-val mono-val">2,055,000</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">ERRORS FOUND</span>
          <span className="qb-val mono-val text-coral">16,400</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">DUPLICATE ENTRIES</span>
          <span className="qb-val mono-val text-gold">2,840</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">MISSING DATA</span>
          <span className="qb-val mono-val text-gold">4,210</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">REFERENCE ERRORS</span>
          <span className="qb-val mono-val text-coral">1,150</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">TIME ERRORS</span>
          <span className="qb-val mono-val text-gold">3,400</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">OUT-OF-RANGE VALUES</span>
          <span className="qb-val mono-val text-coral">4,800</span>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="dashboard-grid-two">
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Quality Score Breakdown</h3>
              <span className="chart-subtitle">How well your data meets quality standards</span>
            </div>
            <span className="badge-pill badge-aurora">QUALITY SCORE</span>
          </div>
          <Plot
            data={[{
              x: report?.dimensions ? Object.keys(report.dimensions) : [],
              y: report?.dimensions ? Object.values(report.dimensions) : [],
              type: 'bar',
              marker: { 
                color: ['#67E8D5', '#38BDF8', '#FBBF24', '#4ADE80'],
                line: { color: 'rgba(255, 255, 255, 0.1)', width: 1 }
              },
              text: report?.dimensions ? Object.values(report.dimensions).map(v => `${v}%`) : [],
              textposition: 'auto',
              textfont: { family: "'IBM Plex Mono', monospace", color: '#07090C' }
            }]}
            layout={getPlotlyLayout({
              height: 290,
              margin: { l: 40, r: 20, t: 20, b: 35 },
              yaxis: { range: [80, 100], ticksuffix: '%' }
            })}
            config={defaultPlotlyConfig}
            useResizeHandler={true}
            style={{ width: '100%' }}
          />
        </div>

        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Types of Issues Found</h3>
              <span className="chart-subtitle">Breakdown of what kinds of errors were found</span>
            </div>
            <span className="badge-pill badge-gold">ISSUE TYPES</span>
          </div>
          <Plot
            data={[{
              labels: report?.issue_distribution ? Object.keys(report.issue_distribution) : [],
              values: report?.issue_distribution ? Object.values(report.issue_distribution) : [],
              type: 'pie',
              hole: 0.58,
              marker: { 
                colors: ['#FBBF24', '#94A3B8', '#FB7185', '#38BDF8', '#67E8D5']
              },
              textinfo: 'percent',
              hoverinfo: 'label+percent+value'
            }]}
            layout={getPlotlyLayout({
              height: 290,
              margin: { l: 20, r: 20, t: 15, b: 20 },
              showlegend: true,
              legend: { orientation: 'v', x: 0.82, y: 0.5 }
            })}
            config={defaultPlotlyConfig}
            useResizeHandler={true}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Record-Level Audit Ledger */}
      <div className="chart-card hud-panel hud-corners">
        <div className="audit-controls-header">
          <div>
            <h3>Detailed Audit Log</h3>
            <span className="chart-subtitle">See exactly what was changed in each record</span>
          </div>

          <div className="audit-actions-row">
            <input 
              type="text" 
              placeholder="Search record ID or rule..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="audit-search-input"
            />
            <div className="audit-chip-group">
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
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Field Changed</th>
                <th>Original Value</th>
                <th>Rule Applied</th>
                <th>Fixed Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAudit.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredAudit.map((a, i) => (
                  <tr key={i}>
                    <td className="mono-val"><strong>{a.record_id}</strong></td>
                    <td><code>{a.issue_type || a.affected_column}</code></td>
                    <td className="mono-val text-coral">{a.original_value}</td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>{a.cleaning_rule}</td>
                    <td className="mono-val text-cyan"><strong>{a.corrected_value}</strong></td>
                    <td>
                      <span className={`status-badge-chip ${(a.final_status || a.status)?.toLowerCase()}`}>
                        {a.final_status || a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataQuality;
