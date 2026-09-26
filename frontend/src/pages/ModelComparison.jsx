import React, { useState, useContext, useEffect } from 'react';
import { FilterContext } from '../contexts/FilterContext';
import { liveComparisonAPI } from '../api/client';
import { FaCheckCircle, FaExclamationCircle, FaShieldAlt, FaBalanceScale, FaBolt, FaPython, FaExchangeAlt, FaCogs, FaDatabase, FaFileExport, FaInfoCircle, FaArrowRight, FaClock, FaUsers } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './ModelComparison.css';

const ModelComparison = () => {
  const { getFilterParams, filters } = useContext(FilterContext);

  const [sparkResult, setSparkResult] = useState(null);
  const [xgbResult, setXgbResult] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [filterMode, setFilterMode] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Load any exported results from Dashboard on mount
  useEffect(() => {
    const savedSpark = localStorage.getItem('pipeline_spark_result');
    const savedXgb = localStorage.getItem('pipeline_xgb_result');
    if (savedSpark) setSparkResult(JSON.parse(savedSpark));
    if (savedXgb) setXgbResult(JSON.parse(savedXgb));
  }, []);

  const runComparison = async () => {
    if (!sparkResult && !xgbResult) return;
    setLoading(true);
    try {
      const res = await liveComparisonAPI.getLiveComparison(getFilterParams());
      setComparisonData(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSparkResult(null);
    setXgbResult(null);
    setComparisonData(null);
    localStorage.removeItem('pipeline_spark_result');
    localStorage.removeItem('pipeline_xgb_result');
  };

  const cases = comparisonData?.cases || [];
  const filteredCases = cases.filter(c => {
    if (filterMode === 'AGREEMENT') return c.match_status;
    if (filterMode === 'DISCREPANCY') return !c.match_status;
    return true;
  });

  const hasBothPipelines = sparkResult && xgbResult;

  // Helper to generate plain-language verdict
  const getVerdict = (result, modelName) => {
    if (!result) return null;
    const isDelayed = result.pred === 'DELAYED';
    const confNum = parseFloat(result.confidence);
    const accNum = result.accuracy;
    
    let severity = 'moderate';
    if (isDelayed && confNum > 80) severity = 'high';
    if (!isDelayed && confNum > 80) severity = 'low';

    return {
      isDelayed,
      severity,
      summary: isDelayed
        ? `${modelName} predicts that the next bus service will likely be DELAYED. Based on ${(result.records_used || 0).toLocaleString()} historical records, the model is ${result.confidence} confident in this prediction. Current boarding activity (${result.raw_data.boarding} passengers) and vehicle load (${result.raw_data.load} passengers) at the ${result.raw_data.hour}:00 hour suggest congestion pressure.`
        : `${modelName} predicts that the next bus service will run ON TIME. Based on ${(result.records_used || 0).toLocaleString()} historical records, the model is ${result.confidence} confident. Current conditions at the ${result.raw_data.hour}:00 hour show manageable boarding (${result.raw_data.boarding} PAX) and load (${result.raw_data.load} PAX) levels.`,
      whatItMeans: isDelayed
        ? `This means commuters may experience longer wait times. Transit operators should consider deploying additional buses or adjusting signal timings to reduce congestion.`
        : `This means the transit system is operating smoothly under current conditions. No immediate corrective action is required.`
    };
  };

  const sparkVerdict = getVerdict(sparkResult, 'PySpark MLlib');
  const xgbVerdict = getVerdict(xgbResult, 'XGBoost');

  return (
    <div className="page-container comparison-page">
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>DUAL-ENGINE VALIDATION // CONSENSUS PIPELINE</span>
          </div>
          <h1 className="hero-main-title">Pipeline Consensus & Analytics</h1>
          <p className="hero-desc">
            Two independent AI models analyze the same transit data and predict whether the next bus will be delayed or on time. Compare their predictions to validate accuracy and build confidence in the results.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaShieldAlt className="text-cyan" /> {comparisonData ? `${comparisonData.agreement_rate}% CONGRUENCE` : 'AWAITING DATA'}</span>
          <span className="sys-badge"><FaCheckCircle className="text-cyan" /> {hasBothPipelines ? 'BOTH PIPELINES READY' : 'EXPORT FROM DASHBOARD'}</span>
        </div>
      </div>

      {/* What This System Does — Plain Language Explainer */}
      <div className="hud-panel hud-corners explainer-box">
        <div className="explainer-icon-wrap">
          <FaInfoCircle size={22} />
        </div>
        <div className="explainer-content">
          <h4>How This Works — A Simple Explanation</h4>
          <p>
            This page compares <strong>two different AI models</strong> that both try to answer the same question: 
            <em> "Will the next bus be delayed or arrive on time?"</em>
          </p>
          <div className="explainer-steps">
            <div className="explainer-step">
              <span className="step-num">1</span>
              <div>
                <strong>Data Collection</strong>
                <p>Both models receive the same real-time data from Karachi's transit system — passenger boarding counts, vehicle loads, and time of day — pulled from a database of 2 million historical records.</p>
              </div>
            </div>
            <div className="explainer-step">
              <span className="step-num">2</span>
              <div>
                <strong>Independent Predictions</strong>
                <p>Each model uses a different algorithm (PySpark RandomForest vs XGBoost) to analyze the data and make its own prediction independently.</p>
              </div>
            </div>
            <div className="explainer-step">
              <span className="step-num">3</span>
              <div>
                <strong>Cross-Validation</strong>
                <p>We compare their answers. When both models agree, we have high confidence. When they disagree, it flags an edge case that needs attention.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid-four">
        <KPICard 
          title="SPARK PIPELINE"
          value={sparkResult ? `${sparkResult.accuracy}%` : '— No Data —'}
          techCode="MLLIB // ACC"
          change={sparkResult ? 'Exported' : 'Pending'}
          changeDirection={sparkResult ? 'up' : 'flat'}
          subtitle={sparkResult ? `${sparkResult.records_used?.toLocaleString()} records trained` : 'Run on Dashboard first'}
          progress={sparkResult ? sparkResult.accuracy : 0}
          colorScheme="gold"
          icon={<FaBolt />}
        />
        <KPICard 
          title="XGBOOST PIPELINE"
          value={xgbResult ? `${xgbResult.accuracy}%` : '— No Data —'}
          techCode="XGB // ACC"
          change={xgbResult ? 'Exported' : 'Pending'}
          changeDirection={xgbResult ? 'up' : 'flat'}
          subtitle={xgbResult ? `${xgbResult.records_used?.toLocaleString()} records trained` : 'Run on Dashboard first'}
          progress={xgbResult ? xgbResult.accuracy : 0}
          colorScheme="sky"
          icon={<FaPython />}
        />
        <KPICard 
          title="MODEL AGREEMENT"
          value={comparisonData ? `${comparisonData.agreement_rate}%` : '— Not Compared —'}
          techCode="REC // AGR"
          change={comparisonData ? 'Live' : 'Pending'}
          changeDirection={comparisonData ? 'up' : 'flat'}
          subtitle={comparisonData ? 'Consensus calculated' : 'Click Compare below'}
          progress={comparisonData ? comparisonData.agreement_rate : 0}
          colorScheme="cyan"
          icon={<FaBalanceScale />}
        />
        <KPICard 
          title="TOTAL RECORDS"
          value={sparkResult ? sparkResult.records_used?.toLocaleString() : '0'}
          techCode="POSTGRES // ROWS"
          change="Live"
          changeDirection="up"
          subtitle="PostgreSQL telemetry rows"
          progress={100}
          colorScheme="emerald"
          icon={<FaDatabase />}
        />
      </div>

      {/* Compare Button */}
      <div className="hud-panel hud-corners" style={{ padding: '24px', textAlign: 'center' }}>
        {hasBothPipelines ? (
          <div>
            <p style={{ marginBottom: '16px', color: '#16A34A', fontWeight: 600 }}>
              ✅ Both pipeline results are loaded. Click below to run the full consensus comparison.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={runComparison}
                disabled={loading}
                style={{ padding: '16px 48px', fontSize: '1.1rem', background: 'var(--color-accent)', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)' }}
              >
                {loading ? '⏳ Running Consensus Analysis...' : '⚡ Run Full Consensus Comparison'}
              </button>
              <button
                onClick={clearAll}
                style={{ padding: '16px 32px', fontSize: '1rem', background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '8px', cursor: 'pointer' }}
              >
                Clear All Data
              </button>
            </div>
          </div>
        ) : (
          <div>
            <FaCogs size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
            <h3 style={{ color: 'var(--color-text-secondary)' }}>Pipeline Data Not Yet Exported</h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '8px auto' }}>
              Go to the <strong>Dashboard</strong>, execute each pipeline (PySpark & XGBoost), and click the <strong>"Export to Compare Page"</strong> button after each run. Then come back here to compare.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              <span style={{ padding: '8px 20px', borderRadius: '6px', background: sparkResult ? '#DCFCE7' : '#FEE2E2', color: sparkResult ? '#16A34A' : '#DC2626', fontWeight: 600, fontSize: '0.9rem' }}>
                {sparkResult ? '✅ Spark Exported' : '❌ Spark Not Exported'}
              </span>
              <span style={{ padding: '8px 20px', borderRadius: '6px', background: xgbResult ? '#DCFCE7' : '#FEE2E2', color: xgbResult ? '#16A34A' : '#DC2626', fontWeight: 600, fontSize: '0.9rem' }}>
                {xgbResult ? '✅ XGBoost Exported' : '❌ XGBoost Not Exported'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Exported Results Side by Side — Enhanced with Verdicts */}
      {(sparkResult || xgbResult) && (
        <div className="split-pipeline-grid">
          {/* Spark Card */}
          <div className="pipeline-card spark-side hud-panel hud-corners">
            <div className="pipeline-side-header">
              <div className="psh-title">
                <FaBolt className="text-gold" />
                <h3>SPARK PIPELINE RESULT</h3>
              </div>
              <span className="tech-tag-sm">{sparkResult ? 'EXPORTED' : 'PENDING'}</span>
            </div>
            {sparkResult ? (
              <div className="pipeline-result-content">
                {/* Verdict Box */}
                <div className={`verdict-box ${sparkVerdict.isDelayed ? 'delayed' : 'on-time'}`}>
                  <div className="verdict-header">
                    <span className="verdict-icon">{sparkVerdict.isDelayed ? '⚠️' : '✅'}</span>
                    <span className="verdict-label">{sparkResult.pred}</span>
                    <span className="verdict-confidence">{sparkResult.confidence} confident</span>
                  </div>
                  <p className="verdict-text">{sparkVerdict.summary}</p>
                  <p className="verdict-action"><strong>What this means:</strong> {sparkVerdict.whatItMeans}</p>
                </div>

                {/* Raw Input Data Strip */}
                <div className="raw-data-strip">
                  <span className="rds-label"><FaDatabase /> Input Data Used</span>
                  <div className="rds-items">
                    <div className="rds-item">
                      <span className="rds-key"><FaUsers /> Boarding</span>
                      <span className="rds-val">{sparkResult.raw_data.boarding} PAX</span>
                    </div>
                    <div className="rds-item">
                      <span className="rds-key">Vehicle Load</span>
                      <span className="rds-val">{sparkResult.raw_data.load} PAX</span>
                    </div>
                    <div className="rds-item">
                      <span className="rds-key"><FaClock /> Time</span>
                      <span className="rds-val">{sparkResult.raw_data.hour}:00</span>
                    </div>
                  </div>
                </div>

                {/* Technical Spec Rows */}
                <div className="pipeline-spec-list">
                  <div className="spec-row"><span className="spec-label">PREDICTION</span><span className="spec-val mono-val" style={{ color: sparkResult.pred === 'DELAYED' ? '#DC2626' : '#16A34A' }}>{sparkResult.pred}</span></div>
                  <div className="spec-row"><span className="spec-label">CONFIDENCE</span><span className="spec-val mono-val">{sparkResult.confidence}</span></div>
                  <div className="spec-row"><span className="spec-label">ACCURACY</span><span className="spec-val mono-val">{sparkResult.accuracy}%</span></div>
                  <div className="spec-row"><span className="spec-label">F1-SCORE</span><span className="spec-val mono-val">{sparkResult.f1_score}</span></div>
                  <div className="spec-row"><span className="spec-label">RMSE ERROR</span><span className="spec-val mono-val text-danger">{sparkResult.rmse}</span></div>
                  <div className="spec-row"><span className="spec-label">LATENCY</span><span className="spec-val mono-val text-cyan">{sparkResult.latency}</span></div>
                  <div className="spec-row"><span className="spec-label">RECORDS TRAINED</span><span className="spec-val mono-val">{sparkResult.records_used?.toLocaleString()}</span></div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <p>No data exported yet. Run Spark pipeline on Dashboard.</p>
              </div>
            )}
          </div>

          {/* XGBoost Card */}
          <div className="pipeline-card python-side hud-panel hud-corners">
            <div className="pipeline-side-header">
              <div className="psh-title">
                <FaPython className="text-cyan" />
                <h3>XGBOOST PIPELINE RESULT</h3>
              </div>
              <span className="tech-tag-sm">{xgbResult ? 'EXPORTED' : 'PENDING'}</span>
            </div>
            {xgbResult ? (
              <div className="pipeline-result-content">
                {/* Verdict Box */}
                <div className={`verdict-box ${xgbVerdict.isDelayed ? 'delayed' : 'on-time'}`}>
                  <div className="verdict-header">
                    <span className="verdict-icon">{xgbVerdict.isDelayed ? '⚠️' : '✅'}</span>
                    <span className="verdict-label">{xgbResult.pred}</span>
                    <span className="verdict-confidence">{xgbResult.confidence} confident</span>
                  </div>
                  <p className="verdict-text">{xgbVerdict.summary}</p>
                  <p className="verdict-action"><strong>What this means:</strong> {xgbVerdict.whatItMeans}</p>
                </div>

                {/* Raw Input Data Strip */}
                <div className="raw-data-strip">
                  <span className="rds-label"><FaDatabase /> Input Data Used</span>
                  <div className="rds-items">
                    <div className="rds-item">
                      <span className="rds-key"><FaUsers /> Boarding</span>
                      <span className="rds-val">{xgbResult.raw_data.boarding} PAX</span>
                    </div>
                    <div className="rds-item">
                      <span className="rds-key">Vehicle Load</span>
                      <span className="rds-val">{xgbResult.raw_data.load} PAX</span>
                    </div>
                    <div className="rds-item">
                      <span className="rds-key"><FaClock /> Time</span>
                      <span className="rds-val">{xgbResult.raw_data.hour}:00</span>
                    </div>
                  </div>
                </div>

                {/* Technical Spec Rows */}
                <div className="pipeline-spec-list">
                  <div className="spec-row"><span className="spec-label">PREDICTION</span><span className="spec-val mono-val" style={{ color: xgbResult.pred === 'DELAYED' ? '#DC2626' : '#16A34A' }}>{xgbResult.pred}</span></div>
                  <div className="spec-row"><span className="spec-label">CONFIDENCE</span><span className="spec-val mono-val">{xgbResult.confidence}</span></div>
                  <div className="spec-row"><span className="spec-label">ACCURACY</span><span className="spec-val mono-val">{xgbResult.accuracy}%</span></div>
                  <div className="spec-row"><span className="spec-label">F1-SCORE</span><span className="spec-val mono-val">{xgbResult.f1_score}</span></div>
                  <div className="spec-row"><span className="spec-label">RMSE ERROR</span><span className="spec-val mono-val text-danger">{xgbResult.rmse}</span></div>
                  <div className="spec-row"><span className="spec-label">LATENCY</span><span className="spec-val mono-val text-cyan">{xgbResult.latency}</span></div>
                  <div className="spec-row"><span className="spec-label">RECORDS TRAINED</span><span className="spec-val mono-val">{xgbResult.records_used?.toLocaleString()}</span></div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <p>No data exported yet. Run XGBoost pipeline on Dashboard.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Table - Only shows after comparison is run */}
      {comparisonData && (
        <div className="chart-card hud-panel hud-corners">
          {/* Insight Summary Box */}
          <div className="comparison-insight-box">
            <div className="insight-icon">
              <FaBalanceScale size={20} />
            </div>
            <div className="insight-content">
              <h4>Consensus Summary</h4>
              <p>
                Out of <strong>{cases.length} test cases</strong>, both models 
                agreed on <strong>{cases.filter(c => c.match_status).length} cases</strong> ({comparisonData.agreement_rate}% agreement rate). 
                They disagreed on <strong>{cases.filter(c => !c.match_status).length} boundary cases</strong> where 
                passenger loads were near the delay threshold — these are edge cases where conditions could go either way.
                {comparisonData.agreement_rate >= 85 
                  ? ' This is a strong consensus, indicating both models are reliable for transit delay predictions.'
                  : ' The models show some divergence, suggesting the delay threshold is not clear-cut for certain conditions.'}
              </p>
            </div>
          </div>

          <div className="audit-controls-header">
            <div>
              <h3>{cases.length}-Case Discrepancy & Consistency Ledger</h3>
              <span className="chart-subtitle">Direct case-by-case prediction reconciliation with boundary condition attribution</span>
            </div>
            <div className="audit-chip-group">
              <button onClick={() => setFilterMode('ALL')} className={`filter-chip-btn ${filterMode === 'ALL' ? 'active' : ''}`}>
                ALL CASES ({cases.length})
              </button>
              <button onClick={() => setFilterMode('AGREEMENT')} className={`filter-chip-btn ${filterMode === 'AGREEMENT' ? 'active' : ''}`}>
                MATCHING ({cases.filter(c => c.match_status).length})
              </button>
              <button onClick={() => setFilterMode('DISCREPANCY')} className={`filter-chip-btn ${filterMode === 'DISCREPANCY' ? 'active' : ''}`}>
                DISCREPANCIES ({cases.filter(c => !c.match_status).length})
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Ground Truth</th>
                  <th>Spark MLlib</th>
                  <th>Python XGBoost</th>
                  <th>Probability Δ</th>
                  <th>Match State</th>
                  <th>Boundary Explanation</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c, i) => (
                  <tr key={i}>
                    <td className="mono-val"><strong>{c.case_id}</strong></td>
                    <td>
                      <span className={`match-badge ${c.actual_result === 1 ? 'discrepancy' : 'agreement'}`}>
                        {c.actual_result === 1 ? 'DELAYED' : 'ON TIME'}
                      </span>
                    </td>
                    <td className="mono-val">
                      <span style={{ color: c.spark_result === 1 ? 'var(--color-danger)' : 'var(--color-accent)' }}>
                        {c.spark_result === 1 ? 'Delayed' : 'On Time'}
                      </span>{' '}
                      <small className="text-dim">({c.spark_probability})</small>
                    </td>
                    <td className="mono-val">
                      <span style={{ color: c.python_result === 1 ? 'var(--color-danger)' : 'var(--color-accent)' }}>
                        {c.python_result === 1 ? 'Delayed' : 'On Time'}
                      </span>{' '}
                      <small className="text-dim">({c.python_probability})</small>
                    </td>
                    <td className="mono-val text-cyan">{c.numerical_difference}</td>
                    <td>
                      <span className={`match-badge ${c.match_status ? 'agreement' : 'discrepancy'}`}>
                        {c.match_status ? 'CONGRUENT' : 'BOUNDARY DIVERGENCE'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {c.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelComparison;
