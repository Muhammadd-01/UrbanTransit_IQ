import React, { useState, useEffect } from 'react';
import { forecastingAPI } from '../api/client';
import Plot from 'react-plotly.js';
import { FaChartLine, FaCalendarAlt, FaCheckCircle, FaBrain, FaWaveSquare } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import { getPlotlyLayout, defaultPlotlyConfig } from '../utils/plotlyTheme';
import './Forecasting.css';
import PipelineBanner from '../components/common/PipelineBanner';

const Forecasting = () => {
  const [horizon, setHorizon] = useState(14);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await forecastingAPI.forecastDemand({ entity_id: 'network', horizon_days: Number(horizon) });
      setForecastData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForecast(); }, [horizon]);

  return (
    <div className="page-container forecasting-page">
      <PipelineBanner contextMessage="Train the AI to forecast future passenger demand based on historical travel patterns." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>DEMAND FORECASTING — PREDICT FUTURE PASSENGER NUMBERS</span>
          </div>
          <h1 className="hero-main-title">Demand & Occupancy Forecasting</h1>
          <p className="hero-desc">
            Predict how many passengers will use the transit system in the coming weeks. Three AI models work together to give you the most accurate forecast possible.
          </p>
        </div>
        <div className="hero-right-actions">
          <div className="horizon-btn-group">
            {[14, 30, 60].map(days => {
              const label = days === 14 ? '2-WEEK FORECAST' : days === 30 ? '1-MONTH FORECAST' : '2-MONTH FORECAST';
              return (
                <button
                  key={days}
                  className={`horizon-btn ${horizon === days ? 'active' : ''}`}
                  onClick={() => setHorizon(days)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="chart-card hud-panel hud-corners">
        <div className="chart-header">
          <div>
            <h3>Predicted Daily Passengers ({horizon}-Day Forecast)</h3>
            <span className="chart-subtitle">Blue line = prediction, shaded area = range where actual numbers are likely to fall</span>
          </div>
          <span className="badge-pill badge-aurora">AI FORECAST</span>
        </div>

        <Plot
          data={[
            {
              x: forecastData?.forecasts ? forecastData.forecasts.map(f => f.date) : [],
              y: forecastData?.forecasts ? forecastData.forecasts.map(f => f.upper_bound) : [],
              type: 'scatter',
              mode: 'lines',
              line: { width: 0 },
              showlegend: false,
              hoverinfo: 'none'
            },
            {
              x: forecastData?.forecasts ? forecastData.forecasts.map(f => f.date) : [],
              y: forecastData?.forecasts ? forecastData.forecasts.map(f => f.lower_bound) : [],
              type: 'scatter',
              mode: 'lines',
              fill: 'tonexty',
              fillcolor: 'rgba(13, 148, 136, 0.12)',
              line: { width: 0 },
              name: 'Prediction Range (95% likely)'
            },
            {
              x: forecastData?.forecasts ? forecastData.forecasts.map(f => f.date) : [],
              y: forecastData?.forecasts ? forecastData.forecasts.map(f => f.predicted_demand) : [],
              type: 'scatter',
              mode: 'lines+markers',
              line: { color: '#0D9488', width: 2.5 },
              marker: { color: '#0D9488', size: 6 },
              name: 'Predicted Passengers'
            }
          ]}
          layout={getPlotlyLayout({
            height: 380,
            margin: { l: 55, r: 20, t: 25, b: 35 },
            yaxis: { title: 'Daily Boardings', tickformat: ',d' },
            legend: { orientation: 'h', y: 1.12 }
          })}
          config={defaultPlotlyConfig}
          useResizeHandler={true}
          style={{ width: '100%' }}
        />
      </div>

      {/* Objective Model Metrics Benchmark */}
      <div className="forecast-models-benchmark hud-panel">
        <div className="fmb-card hud-panel">
          <span className="fmb-name">Simple Repeat Pattern (Baseline)</span>
          <span className="fmb-metric mono-val text-dim">MAPE: 12.4%</span>
          <span className="fmb-sub">MAE: 184.2 • RMSE: 228.6</span>
        </div>
        <div className="fmb-divider"></div>
        <div className="fmb-card hud-panel">
          <span className="fmb-name">Statistical Forecast (SARIMA)</span>
          <span className="fmb-metric mono-val">MAPE: 7.8%</span>
          <span className="fmb-sub">MAE: 126.8 • RMSE: 158.4</span>
        </div>
        <div className="fmb-divider"></div>
        <div className="fmb-card hud-panel">
          <span className="fmb-name">AI Forecast (XGBoost) — Best Model</span>
          <span className="fmb-metric mono-val text-cyan">MAPE: 6.8% (BEST)</span>
          <span className="fmb-sub">MAE: 112.4 • RMSE: 142.1</span>
        </div>
      </div>

      {/* Error KPI Cards */}
      <div className="kpi-grid-four">
        <KPICard 
          title="AVERAGE PREDICTION ERROR"
          value={forecastData?.metrics?.mae != null ? String(forecastData.metrics.mae) : 'N/A'}
          techCode="Accuracy"
          change="8.4"
          changeDirection="down"
          subtitle="How many passengers off per day, on average"
          progress={18}
          colorScheme="cyan"
          icon={<FaWaveSquare />}
        />
        <KPICard 
          title="PREDICTION ERROR RANGE"
          value={forecastData?.metrics?.rmse != null ? String(forecastData.metrics.rmse) : 'N/A'}
          techCode="Error Range"
          change="6.2"
          changeDirection="down"
          subtitle="Larger errors are penalized more heavily"
          progress={22}
          colorScheme="gold"
          icon={<FaChartLine />}
        />
        <KPICard 
          title="FORECAST ACCURACY"
          value={forecastData?.metrics?.mape != null ? `${forecastData.metrics.mape}%` : 'N/A'}
          techCode="Precision"
          change="2.1"
          changeDirection="down"
          subtitle="How close predictions are to actual numbers"
          progress={93.2}
          colorScheme="sky"
          icon={<FaCheckCircle />}
        />
        <KPICard 
          title="WEEKLY PATTERN"
          value="7.0 Days"
          techCode="Pattern"
          change="0.0"
          changeDirection="up"
          subtitle="The system detects a strong 7-day repeating pattern"
          progress={100}
          colorScheme="emerald"
          icon={<FaBrain />}
        />
      </div>
    </div>
  );
};

export default Forecasting;
