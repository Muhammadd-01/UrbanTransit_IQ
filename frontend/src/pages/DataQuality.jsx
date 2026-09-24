import React, { useState, useEffect } from 'react';
import { qualityAPI } from '../api/client';
import Plot from 'react-plotly.js';
import { FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaArrowRight, FaDatabase, FaFilter } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import { getPlotlyLayout, defaultPlotlyConfig } from '../utils/plotlyTheme';
import './DataQuality.css';

const DataQuality = () => {
  const [report, setReport] = useState(null);
  const [auditList, setAuditList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    qualityAPI.getReport('ds-karachi-sample-01').then(res => setReport(res.data)).catch(console.error);
    qualityAPI.getAudit('ds-karachi-sample-01').then(res => setAuditList(res.data)).catch(console.error);
  }, []);

  const filteredAudit = auditList.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch = !searchQuery || 
      a.record_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.affected_column?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cleaning_rule?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="page-container dataquality-page">
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>DATA GOVERNANCE // 4-TIER LIFECYCLE LEDGER</span>
          </div>
          <h1 className="hero-main-title">Data Quality Pipeline & Audit Engine</h1>
          <p className="hero-desc">
            Multi-stage automated validation framework classifying Karachi telemetry across 15 operational business rules into VALID, CORRECTED, FLAGGED, and QUARANTINED tiers.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaShieldAlt className="text-cyan" /> 15 RULES ACTIVE</span>
          <span className="sys-badge"><FaDatabase className="text-cyan" /> 2,055,000 AUDITED</span>
        </div>
      </div>

      {/* Visual Pipeline Flow Sequence */}
      <div className="pipeline-flow-panel hud-panel hud-corners">
        <div className="pipeline-header">
          <span className="tech-tag-sm">INGESTION LIFECYCLE FLOW</span>
          <span className="pipeline-meta">ETL STAGES // AUTOMATED TRANSFORMS</span>
        </div>
        <div className="pipeline-steps">
          <div className="pipeline-step">
            <div className="step-tag">STAGE 01</div>
            <div className="step-title">RAW TELEMETRY</div>
            <div className="step-metric mono-val">2,055,000 Rows</div>
            <div className="step-status text-cyan">Staged in HDFS</div>
          </div>
          <div className="pipeline-arrow"><FaArrowRight /></div>

          <div className="pipeline-step">
            <div className="step-tag">STAGE 02</div>
            <div className="step-title">RULE VALIDATION</div>
            <div className="step-metric mono-val">15 Schema Tests</div>
            <div className="step-status text-success">PK / FK / Types</div>
          </div>
          <div className="pipeline-arrow"><FaArrowRight /></div>

          <div className="pipeline-step">
            <div className="step-tag">STAGE 03</div>
            <div className="step-title">OUTLIER DETECTION</div>
            <div className="step-metric mono-val">3-Sigma & Bounds</div>
            <div className="step-status text-warning">Spikes & Drifts</div>
          </div>
          <div className="pipeline-arrow"><FaArrowRight /></div>

          <div className="pipeline-step">
            <div className="step-tag">STAGE 04</div>
            <div className="step-title">CLEANING / IMPUTE</div>
            <div className="step-metric mono-val">12,400 Handled</div>
            <div className="step-status text-cyan">Median Clamped</div>
          </div>
          <div className="pipeline-arrow"><FaArrowRight /></div>

          <div className="pipeline-step">
            <div className="step-tag">STAGE 05</div>
            <div className="step-title">QUARANTINE LEDGER</div>
            <div className="step-metric mono-val">6,160 Isolated</div>
            <div className="step-status text-coral">Partition Sinks</div>
          </div>
          <div className="pipeline-arrow"><FaArrowRight /></div>

          <div className="pipeline-step active-final">
            <div className="step-tag">STAGE 06</div>
            <div className="step-title">GOLD FABRIC</div>
            <div className="step-metric mono-val">2,036,440 Ready</div>
            <div className="step-status text-success">99.1% Fidelity</div>
          </div>
        </div>
      </div>

      {/* 4-Tier Governance Cards */}
      <div className="kpi-grid-four">
        <KPICard 
          title="VALID (CLEAN)"
          value="98.4%"
          techCode="TIER // 01"
          change="0.2"
          changeDirection="up"
          subtitle="2,022,120 Passed All Rules"
          progress={98.4}
          colorScheme="cyan"
          icon={<FaCheckCircle />}
        />
        <KPICard 
          title="CORRECTED (IMPUTED)"
          value="0.6%"
          techCode="TIER // 02"
          change="0.1"
          changeDirection="down"
          subtitle="12,330 Negative/Null Fixed"
          progress={12}
          colorScheme="gold"
          icon={<FaShieldAlt />}
        />
        <KPICard 
          title="FLAGGED ANOMALIES"
          value="0.7%"
          techCode="TIER // 03"
          change="0.2"
          changeDirection="down"
          subtitle="14,385 Kept with Metadata Tag"
          progress={14}
          colorScheme="sky"
          icon={<FaExclamationTriangle />}
        />
        <KPICard 
          title="QUARANTINED"
          value="0.3%"
          techCode="TIER // 04"
          change="0.05"
          changeDirection="down"
          subtitle="6,165 Isolated from ML Training"
          progress={6}
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
          <span className="qb-label">INVALID RECORDS</span>
          <span className="qb-val mono-val text-coral">16,400</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">DUPLICATE TAPS</span>
          <span className="qb-val mono-val text-gold">2,840</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">MISSING VALUES</span>
          <span className="qb-val mono-val text-gold">4,210</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">FOREIGN KEY ERRORS</span>
          <span className="qb-val mono-val text-coral">1,150</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">TIMESTAMP ERRORS</span>
          <span className="qb-val mono-val text-gold">3,400</span>
        </div>
        <div className="qb-item">
          <span className="qb-label">RANGE VIOLATIONS</span>
          <span className="qb-val mono-val text-coral">4,800</span>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="dashboard-grid-two">
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Quality Dimensions Breakdown</h3>
              <span className="chart-subtitle">Evaluated on ISO 8000 transit benchmarks</span>
            </div>
            <span className="badge-pill badge-aurora">BENCHMARK SCORE</span>
          </div>
          <Plot
            data={[{
              x: ['Completeness', 'Consistency', 'Validity', 'Overall Quality'],
              y: [98.4, 99.1, 97.4, 98.3],
              type: 'bar',
              marker: { 
                color: ['#67E8D5', '#38BDF8', '#FBBF24', '#4ADE80'],
                line: { color: 'rgba(255, 255, 255, 0.1)', width: 1 }
              },
              text: ['98.4%', '99.1%', '97.4%', '98.3%'],
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
              <h3>Issue Distribution by Type</h3>
              <span className="chart-subtitle">Remediated & quarantined error taxonomy</span>
            </div>
            <span className="badge-pill badge-gold">TAXONOMY SHARE</span>
          </div>
          <Plot
            data={[{
              labels: ['Missing Values', 'Duplicate Taps', 'Delay Outliers', 'Negative Counts', 'Broken FK Refs'],
              values: [42, 24, 18, 11, 5],
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
            <h3>Record-Level Audit Trail</h3>
            <span className="chart-subtitle">Live inspection with before/after transformation diffs</span>
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
                <th>Affected Field</th>
                <th>Original Raw</th>
                <th>Remediation Rule</th>
                <th>Cleaned Output</th>
                <th>Audit Status</th>
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
                    <td><code>{a.affected_column}</code></td>
                    <td className="mono-val text-coral">{a.original_value}</td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>{a.cleaning_rule}</td>
                    <td className="mono-val text-cyan"><strong>{a.corrected_value}</strong></td>
                    <td>
                      <span className={`status-badge-chip ${a.status?.toLowerCase()}`}>
                        {a.status}
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
