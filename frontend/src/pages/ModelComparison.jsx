import React, { useState, useContext, useEffect } from 'react';
import { FilterContext } from '../contexts/FilterContext';
import { AuthContext } from '../contexts/AuthContext';
import { liveComparisonAPI, pipelineAPI } from '../api/client';
import { FaCheckCircle, FaExclamationCircle, FaShieldAlt, FaBalanceScale, FaBolt, FaPython, FaExchangeAlt, FaCogs, FaDatabase, FaFileExport, FaInfoCircle, FaArrowRight, FaClock, FaUsers } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './ModelComparison.css';
import ScrollAnimate from '../hooks/useScrollAnimate';

const ModelComparison = () => {
  const { getFilterParams, filters } = useContext(FilterContext);
  const { user } = useContext(AuthContext);
  const role = user?.role || 'viewer';
  const isAdmin = role === 'admin';

  const [sparkResult, setSparkResult] = useState(null);
  const [xgbResult, setXgbResult] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [filterMode, setFilterMode] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Load any exported results from Dashboard on mount (or auto-fetch from backend trained models)
  useEffect(() => {
    const savedSpark = localStorage.getItem('pipeline_spark_result');
    const savedXgb = localStorage.getItem('pipeline_xgb_result');
    let sparkData = null;
    let xgbData = null;
    try { if (savedSpark) { sparkData = JSON.parse(savedSpark); setSparkResult(sparkData); } } catch(e) { console.error(e); }
    try { if (savedXgb) { xgbData = JSON.parse(savedXgb); setXgbResult(xgbData); } } catch(e) { console.error(e); }

    const needsSpark = !sparkData || sparkData.precision === undefined || sparkData.precision === '-';
    const needsXgb = !xgbData || xgbData.precision === undefined || xgbData.precision === '-';

    if (needsSpark || needsXgb) {
      pipelineAPI.getStatus().then(res => {
        if (needsSpark && res.data?.spark_is_trained && res.data?.spark_raw_data) {
          const newSpark = {
            ...sparkData,
            pred: res.data.spark_pred || "ON-TIME",
            confidence: res.data.spark_confidence || "100.0%",
            latency: res.data.spark_latency || "25ms",
            accuracy: res.data.spark_acc ?? res.data.accuracy ?? '-',
            f1_score: res.data.spark_f1 ?? res.data.f1_score ?? '-',
            precision: res.data.spark_precision ?? res.data.precision ?? '-',
            recall: res.data.spark_recall ?? res.data.recall ?? '-',
            mae: res.data.spark_mae ?? res.data.mae ?? '-',
            rmse: res.data.spark_rmse ?? res.data.rmse ?? '-',
            confusion_matrix: res.data.spark_confusion_matrix ?? res.data.confusion_matrix ?? '-',
            mape: res.data.spark_mape,
            r2: res.data.spark_r2,
            records_used: res.data.records_used,
            raw_data: res.data.spark_raw_data,
            trained_at: res.data.trained_at,
            training_time_seconds: res.data.training_time_seconds,
          };
          setSparkResult(newSpark);
        }
        if (needsXgb && res.data?.xgb_is_trained && res.data?.xgb_raw_data) {
          const newXgb = {
            ...xgbData,
            pred: res.data.xgb_pred || "ON-TIME",
            confidence: res.data.xgb_confidence || "100.0%",
            latency: res.data.xgb_latency || "12ms",
            accuracy: res.data.xgb_acc ?? res.data.accuracy ?? '-',
            f1_score: res.data.xgb_f1 ?? res.data.f1_score ?? '-',
            precision: res.data.xgb_precision ?? res.data.precision ?? '-',
            recall: res.data.xgb_recall ?? res.data.recall ?? '-',
            mae: res.data.xgb_mae ?? res.data.mae ?? '-',
            rmse: res.data.xgb_rmse ?? res.data.rmse ?? '-',
            confusion_matrix: res.data.xgb_confusion_matrix ?? res.data.confusion_matrix ?? '-',
            mape: res.data.xgb_mape,
            r2: res.data.xgb_r2,
            records_used: res.data.records_used,
            raw_data: res.data.xgb_raw_data,
            trained_at: res.data.trained_at,
            training_time_seconds: res.data.training_time_seconds,
          };
          setXgbResult(newXgb);
        }
      }).catch(console.error);
    }
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
        ? `${modelName} predicts that the next bus service will likely be DELAYED. Based on ${(result?.records_used || 0).toLocaleString()} historical records, the model is ${result?.confidence || '0%'} confident in this prediction. Current boarding activity (${result?.raw_data?.boarding || 0} passengers) and vehicle load (${result?.raw_data?.load || 0} passengers) at the ${result?.raw_data?.hour || 0}:00 hour suggest congestion pressure.`
        : `${modelName} predicts that the next bus service will run ON TIME. Based on ${(result?.records_used || 0).toLocaleString()} historical records, the model is ${result?.confidence || '0%'} confident. Current conditions at the ${result?.raw_data?.hour || 0}:00 hour show manageable boarding (${result?.raw_data?.boarding || 0} Passengers) and load (${result?.raw_data?.load || 0} Passengers) levels.`,
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
            <span>AI MODEL COMPARISON — DO BOTH MODELS AGREE?</span>
          </div>
          <h1 className="hero-main-title">AI Model Comparison</h1>
          <p className="hero-desc">
            Two independent AI models analyze the same transit data and predict whether the next bus will be delayed or on time. Compare their predictions to validate accuracy and build confidence in the results.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaShieldAlt className="text-cyan" /> {comparisonData ? `${comparisonData.agreement_rate}% AGREEMENT` : 'AWAITING DATA'}</span>
          <span className="sys-badge"><FaCheckCircle className="text-cyan" /> {hasBothPipelines ? 'BOTH MODELS READY' : 'TRAIN MODELS FIRST'}</span>
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
          title="SPARK AI MODEL"
          value={sparkResult ? `${sparkResult.accuracy}%` : '— No Data —'}
          techCode="Accuracy"
          change={sparkResult ? 'Exported' : 'Pending'}
          changeDirection={sparkResult ? 'up' : 'flat'}
          subtitle={sparkResult ? `${sparkResult.records_used?.toLocaleString()} records trained` : 'Run on Dashboard first'}
          progress={sparkResult ? sparkResult.accuracy : 0}
          colorScheme="gold"
          icon={<FaBolt />}
        />
        <KPICard 
          title="XGBOOST AI MODEL"
          value={xgbResult ? `${xgbResult.accuracy}%` : '— No Data —'}
          techCode="Accuracy"
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
          techCode="Match Rate"
          change={comparisonData ? 'Live' : 'Pending'}
          changeDirection={comparisonData ? 'up' : 'flat'}
          subtitle={comparisonData ? 'How often both models agree' : 'Click Compare below'}
          progress={comparisonData ? comparisonData.agreement_rate : 0}
          colorScheme="cyan"
          icon={<FaBalanceScale />}
        />
        <KPICard 
          title="TOTAL RECORDS"
          value={sparkResult ? sparkResult.records_used?.toLocaleString() : '0'}
          techCode="Records"
          change="Live"
          changeDirection="up"
          subtitle="Training data records from database"
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
                {loading ? '⏳ Comparing predictions...' : '⚡ Compare Both Models'}
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
            <h3 style={{ color: 'var(--color-text-secondary)' }}>Pipeline Data Not Yet Deployed</h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '8px auto' }}>
              {isAdmin 
                ? 'Go to the Dashboard, execute each pipeline (Spark & XGBoost), and click the "Export to Compare Page" button after each run. Then come back here to compare.'
                : 'Awaiting Administrator Training — The AI models have not been trained yet. Please contact an Administrator to deploy models.'}
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
                <h3>SPARK MODEL PREDICTION</h3>
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
                      <span className="rds-val">{sparkResult?.raw_data?.boarding || 0} Passengers</span>
                    </div>
                    <div className="rds-item">
                      <span className="rds-key">Vehicle Load</span>
                      <span className="rds-val">{sparkResult?.raw_data?.load || 0} Passengers</span>
                    </div>
                    <div className="rds-item">
                      <span className="rds-key"><FaClock /> Time</span>
                      <span className="rds-val">{sparkResult?.raw_data?.hour || 0}:00</span>
                    </div>
                  </div>
                </div>

                {/* Technical Spec Rows */}
                <div className="pipeline-spec-list">
                  <div className="spec-row"><span className="spec-label">PREDICTION</span><span className="spec-val mono-val" style={{ color: xgbResult.pred === 'DELAYED' ? '#DC2626' : '#16A34A' }}>{xgbResult.pred}</span></div>
                  <div className="spec-row"><span className="spec-label">CONFIDENCE</span><span className="spec-val mono-val">{xgbResult.confidence}</span></div>
                  <div className="spec-row"><span className="spec-label">ACCURACY</span><span className="spec-val mono-val">{xgbResult.accuracy ?? '-'}%</span></div>
                  <div className="spec-row"><span className="spec-label">BALANCE SCORE (F1-SCORE)</span><span className="spec-val mono-val">{xgbResult.f1_score ?? xgbResult.f1 ?? '-'}</span></div>
                  <div className="spec-row"><span className="spec-label">CORRECT POSITIVE RATE (PRECISION)</span><span className="spec-val mono-val">{xgbResult.precision ?? '-'}</span></div>
                  <div className="spec-row"><span className="spec-label">DETECTION RATE (RECALL)</span><span className="spec-val mono-val">{xgbResult.recall ?? '-'}</span></div>
                  <div className="spec-row"><span className="spec-label">MAE (AVERAGE ERROR)</span><span className="spec-val mono-val">{xgbResult.mae ?? '-'}</span></div>
                  <div className="spec-row"><span className="spec-label">RMSE (SPREAD ERROR)</span><span className="spec-val mono-val text-danger">{xgbResult.rmse ?? '-'}</span></div>
                  <div className="spec-row"><span className="spec-label">CONFUSION MATRIX</span><span className="spec-val mono-val">{typeof xgbResult.confusion_matrix === 'object' ? JSON.stringify(xgbResult.confusion_matrix) : (xgbResult.confusion_matrix ?? '-')}</span></div>
                  <div className="spec-row"><span className="spec-label">LATENCY</span><span className="spec-val mono-val text-cyan">{xgbResult.latency ?? '-'}</span></div>
                  <div className="spec-row"><span className="spec-label">RECORDS TRAINED</span><span className="spec-val mono-val">{xgbResult.records_used?.toLocaleString()}</span></div>
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
                <h3>XGBOOST MODEL PREDICTION</h3>
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
                      <span className="rds-val">{xgbResult?.raw_data?.boarding || 0} Passengers</span>
                    </div>
                    <div className="rds-item">
                      <span className="rds-key">Vehicle Load</span>
                      <span className="rds-val">{xgbResult?.raw_data?.load || 0} Passengers</span>
                    </div>
                    <div className="rds-item">
                      <span className="rds-key"><FaClock /> Time</span>
                      <span className="rds-val">{xgbResult?.raw_data?.hour || 0}:00</span>
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
              <h3>{cases.length} Test Cases — Prediction Comparison</h3>
              <span className="chart-subtitle">Comparing each model's prediction side by side</span>
            </div>
            <div className="audit-chip-group">
              <button onClick={() => setFilterMode('ALL')} className={`filter-chip-btn ${filterMode === 'ALL' ? 'active' : ''}`}>
                ALL CASES ({cases.length})
              </button>
              <button onClick={() => setFilterMode('AGREEMENT')} className={`filter-chip-btn ${filterMode === 'AGREEMENT' ? 'active' : ''}`}>
                AGREEMENTS ({cases.filter(c => c.match_status).length})
              </button>
              <button onClick={() => setFilterMode('DISCREPANCY')} className={`filter-chip-btn ${filterMode === 'DISCREPANCY' ? 'active' : ''}`}>
                DISAGREEMENTS ({cases.filter(c => !c.match_status).length})
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table table-animate">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Actual Result</th>
                  <th>Spark MLlib</th>
                  <th>Python XGBoost</th>
                  <th>Confidence Diff</th>
                  <th>Agreement</th>
                  <th>Why They Differ</th>
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
                        {c.match_status ? 'AGREE' : 'DISAGREE (CLOSE CALL)'}
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
