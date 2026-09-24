import React, { useState, useEffect } from 'react';
import { comparisonAPI } from '../api/client';
import { FaCheckCircle, FaExclamationCircle, FaProjectDiagram, FaBalanceScale } from 'react-icons/fa';
import './ModelComparison.css';

const ModelComparison = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    comparisonAPI.getDualPipeline().then(res => setData(res.data));
  }, []);

  return (
    <div className="page-container comparison-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Dual Pipeline Comparison & Validation</h1>
          <p className="page-desc">
            Independent dual-engine reconciliation comparing Spark MLlib GBT against Python Scikit-Learn / XGBoost on 100 unseen test cases with boundary explanation analysis.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-aurora)' }}>
          <div className="kpi-header">MODEL AGREEMENT RATE</div>
          <div className="kpi-value" style={{ color: 'var(--accent-aurora)' }}>{data?.agreement_rate || 88.0}%</div>
          <div className="kpi-trend">Across 100 Unseen Test Cases</div>
        </div>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-gold)' }}>
          <div className="kpi-header">SPARK GBT F1-SCORE</div>
          <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>0.838</div>
          <div className="kpi-trend">ROC-AUC: 0.894 • PySpark Pipeline</div>
        </div>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-violet)' }}>
          <div className="kpi-header">PYTHON XGBOOST F1-SCORE</div>
          <div className="kpi-value" style={{ color: 'var(--accent-violet)' }}>0.846</div>
          <div className="kpi-trend">ROC-AUC: 0.902 • Scikit-Learn Stack</div>
        </div>
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FaBalanceScale style={{ color: 'var(--accent-gold)' }} />
          <h3>100-Case Discrepancy & Consistency Ledger</h3>
        </div>

        <div className="table-container" style={{ border: 'none', background: 'transparent', padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Actual Ground Truth</th>
                <th>Spark MLlib GBT</th>
                <th>Python XGBoost</th>
                <th>Probability Delta</th>
                <th>Consistency Attribution</th>
              </tr>
            </thead>
            <tbody>
              {data?.cases?.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{c.case_id}</td>
                  <td>
                    <span className={`match-badge ${c.actual_result === 1 ? 'discrepancy' : 'agreement'}`}>
                      {c.actual_result === 1 ? 'Delayed' : 'On Time'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: c.spark_result === 1 ? 'var(--accent-coral)' : 'var(--accent-aurora)' }}>
                    {c.spark_result === 1 ? 'Delayed' : 'On Time'} <small style={{ color: 'var(--text-muted)' }}>({c.spark_probability})</small>
                  </td>
                  <td style={{ fontWeight: '700', color: c.python_result === 1 ? 'var(--accent-coral)' : 'var(--accent-aurora)' }}>
                    {c.python_result === 1 ? 'Delayed' : 'On Time'} <small style={{ color: 'var(--text-muted)' }}>({c.python_probability})</small>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>{c.numerical_difference}</td>
                  <td style={{ fontSize: '0.82rem', color: c.match_status ? 'var(--accent-aurora)' : 'var(--accent-gold)' }}>
                    {c.explanation}
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

export default ModelComparison;
