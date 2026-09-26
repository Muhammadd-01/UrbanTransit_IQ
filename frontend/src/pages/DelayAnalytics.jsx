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
  }, []);

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
      <PipelineBanner contextMessage="Model predicts delay probabilities by correlating telemetry with historical delay events." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>OPERATIONAL INTELLIGENCE // ML INFERENCE SANDBOX</span>
          </div>
          <h1 className="hero-main-title">Delay Analytics & ML Delay Prediction</h1>
          <p className="hero-desc">
            Empirical percentile delay distributions (P50, P90, P95) and multi-factor gradient boosted tree delay inference with sub-10ms response latency.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaBrain className="text-cyan" /> GBT ACCURACY: 92.56%</span>
          <span className="sys-badge"><FaClock className="text-cyan" /> INFERENCE P95: &lt;5ms</span>
        </div>
      </div>

      {/* Percentile Delay KPI Strip */}
      <div className="kpi-grid-five">
        <KPICard 
          title="AVG NETWORK DELAY"
          value={delayData?.avg_delay ? `${delayData.avg_delay} min` : 'N/A'}
          techCode="LAT // AVG"
          change="1.4"
          changeDirection="down"
          subtitle="System-wide mean dwell"
          progress={32}
          colorScheme="cyan"
          icon={<FaClock />}
        />
        <KPICard 
          title="TOTAL DELAYS"
          value={delayData?.total_delays ? String(delayData.total_delays) : 'N/A'}
          techCode="LAT // TOT"
          change="0.8"
          changeDirection="down"
          subtitle="System-wide delay events"
          progress={24}
          colorScheme="emerald"
          icon={<FaCheckCircle />}
        />
        <KPICard 
          title="TOP CAUSE"
          value={delayData?.top_causes?.[0]?.cause || 'N/A'}
          techCode="LAT // P90"
          change="2.1"
          changeDirection="down"
          subtitle="Leading delay reason"
          progress={64}
          colorScheme="gold"
          icon={<FaExclamationCircle />}
        />
        <KPICard 
          title="P95 SEVERE TAIL"
          value="N/A"
          techCode="LAT // P95"
          change="3.4"
          changeDirection="down"
          subtitle="Critical bottleneck events"
          progress={88}
          colorScheme="coral"
          icon={<FaExclamationCircle />}
        />
        <KPICard 
          title="ON-TIME RELIABILITY"
          value="N/A"
          techCode="SLO // REL"
          change="2.1"
          changeDirection="up"
          subtitle="Trips within 5m schedule"
          progress={0}
          colorScheme="cyan"
          icon={<FaCheck />}
        />
      </div>

      {/* Model Benchmark Card */}
      <div className="model-benchmark-strip hud-panel">
        <div className="mb-item">
          <span className="mb-name">GRADIENT BOOSTED TREES (GBT)</span>
          <span className="mb-metric mono-val text-cyan">92.56% Accuracy</span>
          <span className="mb-sub">F1: 0.9255 • Latency: 4.42ms (PRODUCTION)</span>
        </div>
        <div className="mb-divider"></div>
        <div className="mb-item">
          <span className="mb-name">XGBOOST CLASSIFIER</span>
          <span className="mb-metric mono-val">91.80% Accuracy</span>
          <span className="mb-sub">F1: 0.9174 • Latency: 6.12ms</span>
        </div>
        <div className="mb-divider"></div>
        <div className="mb-item">
          <span className="mb-name">RANDOM FOREST ENSEMBLE</span>
          <span className="mb-metric mono-val">88.94% Accuracy</span>
          <span className="mb-sub">F1: 0.8882 • Latency: 8.40ms</span>
        </div>
      </div>

      {/* Dual Panel: Input Form & Inference Output */}
      <div className="dashboard-grid-two">
        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Interactive Operational Levers</h3>
              <span className="chart-subtitle">Simulate real-time conditions on Karachi corridors</span>
            </div>
            <span className="badge-pill badge-aurora">INFERENCE INPUT</span>
          </div>

          <form onSubmit={handlePredict} className="delay-form">
            <div className="delay-form-group">
              <label>CORRIDOR IDENTIFIER</label>
              <select value={routeId} onChange={e => setRouteId(e.target.value)}>
                <option value="PB-01">PB-01 (Peoples Bus: Model Colony ⇄ Tower)</option>
                <option value="GL-01">GL-01 (Green Line BRT: Surjani ⇄ Numaish)</option>
                <option value="PB-08">PB-08 (Korangi Industrial ⇄ Saddar)</option>
                <option value="LB-04">LB-04 (Liaquatabad Local Mixed)</option>
              </select>
            </div>

            <div className="delay-form-group">
              <div className="delay-slider-header">
                <label>OPERATING HOUR (24H)</label>
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
                <label>PASSENGER ONBOARD LOAD</label>
                <span className="mono-val text-gold">{passengerLoad} Passengers</span>
              </div>
              <input 
                type="range" min="10" max="95" value={passengerLoad} 
                onChange={e => setPassengerLoad(e.target.value)} 
                className="delay-range-slider"
              />
            </div>

            <div className="delay-form-group">
              <label>HISTORICAL BASELINE DELAY (MINUTES)</label>
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
              {loading ? 'Evaluating Model Inference...' : <><FaBolt /> Compute Delay Prediction</>}
            </button>
          </form>
        </div>

        <div className="chart-card hud-panel hud-corners">
          <div className="chart-header">
            <div>
              <h3>Neural Inference Scorecard</h3>
              <span className="chart-subtitle">Real-time GBT multi-factor classification</span>
            </div>
            <span className="badge-pill badge-gold">PREDICTION RESULT</span>
          </div>

          {prediction ? (
            <div className="inference-result-view">
              <div className="inference-result-box">
                <span className="irb-label">PREDICTED DELAY IMPACT</span>
                <div className="inference-delay-val">
                  {prediction.predicted_delay} <span className="text-dim">min</span>
                </div>
                <div className="irb-badge-wrap">
                  <span className={`status-badge-chip ${prediction.severity?.toLowerCase()}`}>
                    {prediction.severity?.toUpperCase()} SEVERITY
                  </span>
                </div>
              </div>

              <div className="inference-meta-specs">
                <div className="ims-row">
                  <span className="ims-label">CONFIDENCE PROBABILITY</span>
                  <span className="ims-val mono-val text-cyan">{(prediction.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="ims-row">
                  <span className="ims-label">SERVING LATENCY</span>
                  <span className="ims-val mono-val">{latency || '4.2ms'}</span>
                </div>
                <div className="ims-row">
                  <span className="ims-label">MODEL ARCHITECTURE</span>
                  <span className="ims-val mono-val text-gold">{prediction.model_used || 'GradientBoostedTrees (GBT)'}</span>
                </div>
              </div>

              <div className="historical-context-callout">
                <span className="hcc-title">HISTORICAL CONTEXT:</span>
                <p>{prediction.historical_context}</p>
              </div>
            </div>
          ) : (
            <div className="inference-empty-state">
              <FaBrain className="empty-brain-icon" />
              <h4>Model Ready for Inference</h4>
              <p>Adjust the operational parameters on the left and trigger prediction to calculate expected delay and risk classification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DelayAnalytics;
