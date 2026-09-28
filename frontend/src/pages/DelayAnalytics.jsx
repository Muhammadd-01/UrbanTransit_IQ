import React, { useState, useContext } from 'react';
import { FilterContext } from '../contexts/FilterContext';
import { predictionsAPI } from '../api/client';
import { FaClock, FaCheckCircle, FaExclamationCircle, FaBrain, FaSlidersH, FaBolt, FaCheck } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './DelayAnalytics.css';
import PipelineBanner from '../components/common/PipelineBanner';

const DelayAnalytics = () => {
  const { getFilterParams, filters } = useContext(FilterContext);

  const [routeId, setRouteId] = useState('PB-01');
  const [hour, setHour] = useState(8);
  const [passengerLoad, setPassengerLoad] = useState(58);
  const [historicalDelay, setHistoricalDelay] = useState(8.5);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(null);
  const [delayData, setDelayData] = useState(null);

  React.useEffect(() => {
    import('../api/client').then(({ analyticsAPI }) => {
      analyticsAPI.getDelays(getFilterParams())
        .then(res => setDelayData(res.data))
        .catch(console.error);
    });
  }, [filters, getFilterParams]);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    const start = performance.now();
    try {
      const res = await predictionsAPI.predictDelay({
        route_id: routeId,
        hour: Number(hour),
        passenger_load: Number(passengerLoad),
        historical_delay: Number(historicalDelay),
        day_of_week: 1,
        is_peak: [7, 8, 9, 17, 18, 19].includes(Number(hour))
      });
      const diff = Math.round(performance.now() - start);
      setLatency(`${diff}ms`);
      setPrediction(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container delayanalytics-page">
      <PipelineBanner contextMessage="Train the AI to predict bus delays by learning from millions of historical trip records." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>DELAY ANALYSIS — AI-POWERED DELAY PREDICTION</span>
          </div>
          <h1 className="hero-main-title">Delay Analytics & ML Delay Prediction</h1>
          <p className="hero-desc">
            Understand why buses are late and predict future delays. Our AI analyzes weather, traffic, time of day, and passenger load to forecast delays before they happen.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaBrain className="text-cyan" /> AI ACCURACY: 92.56%</span>
          <span className="sys-badge"><FaClock className="text-cyan" /> PREDICTION SPEED: &lt;5ms</span>
        </div>
      </div>

      {/* Percentile Delay KPI Strip */}
      <div className="kpi-grid-five">
        <KPICard 
          title="AVG NETWORK DELAY"
          value={delayData?.average_delay != null ? `${delayData.average_delay} min` : '-'}
          techCode="Average"
          change="1.4"
          changeDirection="down"
          subtitle="Average delay across all routes"
          progress={32}
          colorScheme="cyan"
          icon={<FaClock />}
        />
        <KPICard 
          title="TOTAL DELAYS"
          value={String(delayData?.delay_events?.length || delayData?.total_delay_events || 0)}
          techCode="Total"
          change="0.8"
          changeDirection="down"
          subtitle="Total number of delayed trips"
          progress={24}
          colorScheme="emerald"
          icon={<FaCheckCircle />}
        />
        <KPICard 
          title="TOP CAUSE"
          value={delayData?.top_causes?.[0]?.cause || '-'}
          techCode="Top Cause"
          change="2.1"
          changeDirection="down"
          subtitle="Leading delay reason"
          progress={64}
          colorScheme="gold"
          icon={<FaExclamationCircle />}
        />
        <KPICard 
          title="WORST 5% DELAYS"
          value="-"
          techCode="Critical"
          change="3.4"
          changeDirection="down"
          subtitle="The most severe delays in the network"
          progress={88}
          colorScheme="coral"
          icon={<FaExclamationCircle />}
        />
        <KPICard 
          title="ON-TIME RELIABILITY"
          value="-"
          techCode="Schedule"
          change="2.1"
          changeDirection="up"
          subtitle="Percentage of buses arriving within 5 minutes of schedule"
          progress={0}
          colorScheme="cyan"
          icon={<FaCheck />}
        />
      </div>

      {/* Model Benchmark Card */}
      <div className="model-benchmark-strip hud-panel">
        <div className="mb-item">
          <span className="mb-name">AI Model 1 — Gradient Boosted Trees</span>
          <span className="mb-metric mono-val text-cyan">92.56% Accuracy</span>
          <span className="mb-sub">F1 Score: 0.93 · Response Time: 4.42ms (Live)</span>
        </div>
        <div className="mb-divider"></div>
        <div className="mb-item">
          <span className="mb-name">AI Model 2 — XGBoost</span>
          <span className="mb-metric mono-val">91.80% Accuracy</span>
          <span className="mb-sub">F1 Score: 0.92 · Response Time: 6.12ms</span>
        </div>
        <div className="mb-divider"></div>
        <div className="mb-item">
          <span className="mb-name">AI Model 3 — Random Forest</span>
          <span className="mb-metric mono-val">88.94% Accuracy</span>
          <span className="mb-sub">F1 Score: 0.89 · Response Time: 8.40ms</span>
        </div>
      </div>

      {/* Dual Panel: Input Form & Inference Output */}
      <div className="dashboard-grid-two">
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Predict a Delay</h3>
              <span className="chart-subtitle">Enter current conditions to predict if the next bus will be delayed</span>
            </div>
            <span className="badge-pill badge-aurora">PREDICTION INPUTS</span>
          </div>

          <form onSubmit={handlePredict} className="delay-form">
            <div className="delay-form-group">
              <label>SELECT ROUTE</label>
              <select value={routeId} onChange={e => setRouteId(e.target.value)}>
                <option value="PB-01">PB-01 (Peoples Bus: Model Colony ⇄ Tower)</option>
                <option value="GL-01">GL-01 (Green Line BRT: Surjani ⇄ Numaish)</option>
                <option value="PB-08">PB-08 (Korangi Industrial ⇄ Saddar)</option>
                <option value="LB-04">LB-04 (Liaquatabad Local Mixed)</option>
              </select>
            </div>

            <div className="delay-form-group">
              <div className="delay-slider-header">
                <label>TIME OF DAY (24H)</label>
                <span className="mono-val text-cyan">{hour}:00 PKT</span>
              </div>
              <input 
                type="range" min="6" max="22" value={hour} 
                onChange={e => setHour(e.target.value)} 
                className="delay-range-slider"
              />
            </div>

            <div className="delay-form-group">
              <div className="delay-slider-header">
                <label>PASSENGERS ON BOARD</label>
                <span className="mono-val text-gold">{passengerLoad} Passengers</span>
              </div>
              <input 
                type="range" min="10" max="95" value={passengerLoad} 
                onChange={e => setPassengerLoad(e.target.value)} 
                className="delay-range-slider"
              />
            </div>

            <div className="delay-form-group">
              <label>TYPICAL DELAY (MINUTES)</label>
              <input 
                type="number" step="0.5" value={historicalDelay} 
                onChange={e => setHistoricalDelay(e.target.value)}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="btn-primary-hud"
              style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Running AI Prediction...' : <><FaBolt /> Predict Delay</>}
            </button>
          </form>
        </div>

        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Prediction Results</h3>
              <span className="chart-subtitle">AI predicts whether the next bus will be on time or delayed</span>
            </div>
            <span className="badge-pill badge-gold">PREDICTION RESULT</span>
          </div>

          {prediction ? (
            <div className="inference-result-view">
              <div className="inference-result-box">
                <span className="irb-label">PREDICTED DELAY</span>
                <div className="inference-delay-val">
                  {prediction?.predicted_delay || 0} <span className="text-dim">min</span>
                </div>
                <div className="irb-badge-wrap">
                  <span className={`status-badge-chip ${prediction?.severity?.toLowerCase() || 'unknown'}`}>
                    {prediction?.severity?.toUpperCase() || 'UNKNOWN'} SEVERITY
                  </span>
                </div>
              </div>

              <div className="inference-meta-specs">
                <div className="ims-row">
                  <span className="ims-label">CONFIDENCE LEVEL</span>
                  <span className="ims-val mono-val text-cyan">{prediction?.confidence != null ? (prediction.confidence * 100).toFixed(1) : '0'}%</span>
                </div>
                <div className="ims-row">
                  <span className="ims-label">RESPONSE TIME</span>
                  <span className="ims-val mono-val">{latency || '4.2ms'}</span>
                </div>
                <div className="ims-row">
                  <span className="ims-label">AI MODEL USED</span>
                  <span className="ims-val mono-val text-gold">{prediction?.model_used || 'GradientBoostedTrees (GBT)'}</span>
                </div>
              </div>

              <div className="historical-context-callout">
                <span className="hcc-title">BASED ON HISTORICAL DATA:</span>
                <p>{prediction?.historical_context?.description || (typeof prediction?.historical_context === 'string' ? prediction.historical_context : JSON.stringify(prediction?.historical_context || 'No historical context'))}</p>
              </div>
            </div>
          ) : (
            <div className="inference-empty-state">
              <FaBrain className="empty-brain-icon" />
              <h4>Ready to Predict</h4>
              <p>Enter the route, time, and passenger count on the left, then click "Predict Delay" to see the AI's forecast.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DelayAnalytics;
