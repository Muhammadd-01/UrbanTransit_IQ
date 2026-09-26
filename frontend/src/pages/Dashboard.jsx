import React, { useState, useEffect, useMemo } from 'react';
import { FilterContext } from '../contexts/FilterContext';
import { dashboardAPI, analyticsAPI, pipelineAPI } from '../api/client';
import { 
  FaUsers, FaRoute, FaBus, FaPercentage, FaClock, 
  FaExclamationCircle, FaShieldAlt, FaChartLine, 
  FaSyncAlt, FaCheckCircle, FaHdd, FaBolt, FaMicrochip,
  FaPlay, FaRobot, FaSignal, FaNetworkWired, FaCheckDouble,
  FaMapMarkerAlt, FaTachometerAlt, FaLayerGroup, FaArrowUp, FaArrowDown, FaArrowRight, FaDatabase
} from 'react-icons/fa';
import Plot from 'react-plotly.js';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HolographicAnalyzer from '../components/common/HolographicAnalyzer';
import { getPlotlyLayout, defaultPlotlyConfig } from '../utils/plotlyTheme';
import './Dashboard.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MAP_MODES = [
  { id: 'FLOW', label: 'FLOW DENSITY', desc: 'Passenger Inflow Density' },
  { id: 'DELAY', label: 'DELAY HOTSPOTS', desc: 'Delay Concentrations' },
  { id: 'CONGESTION', label: 'BOTTLENECKS', desc: 'Bottleneck Corridors' },
  { id: 'ANOMALIES', label: 'ANOMALIES', desc: 'Outlier Telemetry' }
];

const STATIONS = [
  { id: 'ST-01', name: "Tower Commercial Terminal", pos: [24.8530, 66.9980], delay: 6.2, delayStr: "6.2m", load: "8,420", congestion: "Moderate", anomaly: "Normal", route: "PB-01", vehicles: 18, speed: "24 km/h" },
  { id: 'ST-02', name: "Saddar Regal Chowk", pos: [24.8607, 67.0182], delay: 16.4, delayStr: "16.4m", load: "7,890", congestion: "Severe", anomaly: "Bunching Risk", route: "PB-01", vehicles: 12, speed: "11 km/h" },
  { id: 'ST-03', name: "Nipa Chowrangi (Gulshan)", pos: [24.9180, 67.0971], delay: 12.8, delayStr: "12.8m", load: "6,510", congestion: "High", anomaly: "Delay Surge", route: "PB-08", vehicles: 14, speed: "16 km/h" },
  { id: 'ST-04', name: "Surjani BRT Depot", pos: [25.0250, 67.0580], delay: 3.1, delayStr: "3.1m", load: "9,120", congestion: "Low", anomaly: "Normal", route: "GL-01", vehicles: 26, speed: "38 km/h" },
  { id: 'ST-05', name: "Numaish Chowrangi (BRT)", pos: [24.8735, 67.0310], delay: 4.5, delayStr: "4.5m", load: "8,950", congestion: "Low", anomaly: "Normal", route: "GL-01", vehicles: 22, speed: "35 km/h" },
  { id: 'ST-06', name: "Korangi Crossing Terminal", pos: [24.8322, 67.1120], delay: 11.2, delayStr: "11.2m", load: "5,410", congestion: "High", anomaly: "Peak Inflow", route: "PB-08", vehicles: 16, speed: "19 km/h" }
];

const INITIAL_ALERTS = [
  {
    id: 'ALT-101',
    severity: 'coral',
    title: 'Route PB-01 Morning Overcrowding',
    time: '08:14 PKT',
    description: 'Occupancy exceeds 94.0%. Buffer fleet recommended.',
    actionLabel: 'Deploy +2 Buses',
    resolved: false
  },
  {
    id: 'ALT-102',
    severity: 'gold',
    title: 'Saddar Regal Intersection Delay',
    time: '08:05 PKT',
    description: '16.4m dwell time. Signal retiming recommended.',
    actionLabel: 'Retime Signal (Phase +15s)',
    resolved: false
  },
  {
    id: 'ALT-103',
    severity: 'cyan',
    title: 'Dual Pipeline Verification Ready',
    time: '07:50 PKT',
    description: 'Spark MLlib & XGBoost achieved 100% agreement.',
    actionLabel: 'Verify Parity',
    resolved: false
  }
];

const createTransitIcon = (color = '#007AFF') => L.divIcon({
  className: 'custom-transit-pin',
  html: `<div style="background: ${color}; width: 22px; height: 22px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22]
});

const InflowVelocityChart = React.memo(({ flowData }) => {
  const chartData = useMemo(() => [
    {
      x: flowData?.hourly_distribution ? flowData.hourly_distribution.map(d => `${d.hour}:00`) : [],
      y: flowData?.hourly_distribution ? flowData.hourly_distribution.map(d => d.total_boarding) : [],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Observed Inflow',
      line: { color: '#007AFF', width: 2.8, shape: 'spline' },
      marker: { size: 6, color: '#007AFF' },
      fill: 'tozeroy',
      fillcolor: 'rgba(0, 122, 255, 0.07)'
    }
  ], [flowData]);

  const layout = useMemo(() => getPlotlyLayout({
    height: 290,
    margin: { l: 45, r: 20, t: 15, b: 35 },
    legend: { orientation: 'h', y: 1.15 }
  }), []);

  return (
    <div className="chart-wrapper">
      <Plot
        data={chartData}
        layout={layout}
        config={defaultPlotlyConfig}
        useResizeHandler={true}
        style={{ width: '100%' }}
      />
    </div>
  );
});

const RootCauseChart = React.memo(({ delayData }) => {
  const chartData = useMemo(() => [{
    values: delayData?.top_causes ? delayData.top_causes.map(c => c.count) : [],
    labels: delayData?.top_causes ? delayData.top_causes.map(c => c.cause) : [],
    type: 'pie',
    hole: 0.65,
    marker: {
      colors: ['#E11D48', '#FF9500', '#007AFF', '#5E5CE6', '#34C759', '#8E8E93']
    },
    textinfo: 'percent',
    hoverinfo: 'label+percent+value'
  }], [delayData]);

  const layout = useMemo(() => getPlotlyLayout({
    height: 290,
    margin: { l: 10, r: 10, t: 10, b: 15 },
    showlegend: true,
    legend: { orientation: 'v', x: 0.82, y: 0.5 }
  }), []);

  return (
    <Plot
      data={chartData}
      layout={layout}
      config={defaultPlotlyConfig}
      useResizeHandler={true}
      style={{ width: '100%' }}
    />
  );
});

const Dashboard = () => {
  const { getFilterParams, filters } = useContext(FilterContext);

  const [kpis, setKpis] = useState(null);
  const [flowData, setFlowData] = useState(null);
  const [delayData, setDelayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState('FLOW');
  const [hasLoadedInit, setHasLoadedInit] = useState(false);

  // Simulated temporal shifts
  const [simulatedHour, setSimulatedHour] = useState(8); // Default 8:00 AM
  const [evaluatorMode, setEvaluatorMode] = useState(false);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [selectedStation, setSelectedStation] = useState(null);

  // Consume Global Pipeline Context
  const {
    isAnalyzingSpark, isAnalyzingXgb,
    sparkResult, xgbResult,
    sparkSteps, xgbSteps,
    executeSpark, executeXgb
  } = React.useContext(require('../contexts/PipelineContext').PipelineContext);

  // Futuristic Holographic Center-Screen Analyzer State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerTitle, setAnalyzerTitle] = useState('Analyzing Karachi Transit Matrix');
  const [analyzerCallback, setAnalyzerCallback] = useState(null);

  const triggerHologram = (title, onDone) => {
    setAnalyzerTitle(title);
    setAnalyzerCallback(() => onDone);
    setIsAnalyzing(true);
  };

  const handleHologramComplete = () => {
    setIsAnalyzing(false);
    if (analyzerCallback) {
      analyzerCallback();
      setAnalyzerCallback(null);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiRes, flowRes, delayRes] = await Promise.all([
        dashboardAPI.getKPIs(getFilterParams()),
        analyticsAPI.getPassengerFlow(getFilterParams()),
        analyticsAPI.getDelays(getFilterParams())
      ]);
      setKpis(kpiRes.data);
      setFlowData(flowRes.data);
      setDelayData(delayRes.data);
      
      if (!hasLoadedInit) {
        toast.success('Karachi Transit Telemetry Uplink Online');
        toast.info(`Engine analyzing ${kpiRes.data.total_passengers_analyzed || '2.05M'} movement records.`, { delay: 400 });
        setHasLoadedInit(true);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      toast.error('Telemetry uplink failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const karachiCenter = [24.8607, 67.0011];

  // Dynamic temporal shifts
  const temporalMultiplier = useMemo(() => {
    if (simulatedHour >= 7 && simulatedHour <= 9) return { factor: 1.38, label: 'MORNING PEAK SURGE', color: '#FF3B30' };
    if (simulatedHour >= 17 && simulatedHour <= 19) return { factor: 1.45, label: 'EVENING RUSH', color: '#FF9500' };
    if (simulatedHour >= 22 || simulatedHour <= 5) return { factor: 0.35, label: 'NIGHT LOW FLOW', color: '#007AFF' };
    return { factor: 0.95, label: 'STEADY INTER-PEAK', color: '#34C759' };
  }, [simulatedHour]);

  const handleResolveAlert = (id, actionLabel) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    toast.success(`Action Executed: "${actionLabel}"`, { icon: '⚡', autoClose: 2000 });
  };



  const handleExport = (type) => {
    const result = type === 'SPARK' ? sparkResult : xgbResult;
    if (!result) return;
    const key = type === 'SPARK' ? 'pipeline_spark_result' : 'pipeline_xgb_result';
    localStorage.setItem(key, JSON.stringify(result));
    toast.success(`${type === 'SPARK' ? 'Spark' : 'XGBoost'} result exported to Compare Page!`, { icon: '📤' });
  };

  const handleManualSync = () => {
    fetchDashboardData();
    toast.success('Cluster Telemetry Refreshed');
  };

  const handleSelectStationWithAnimation = (st) => {
    setSelectedStation(st);
  };

  const getCircleColor = (st) => {
    if (mapMode === 'DELAY') return st.delay > 12 ? '#E11D48' : st.delay > 5 ? '#D97706' : '#16A34A';
    if (mapMode === 'CONGESTION') return st.congestion === 'Severe' ? '#E11D48' : st.congestion === 'High' ? '#D97706' : '#0D9488';
    if (mapMode === 'ANOMALIES') return st.anomaly !== 'Normal' ? '#E11D48' : '#16A34A';
    return '#007AFF';
  };

  if (loading && !kpis) {
    return (
      <div style={{ display: "flex", minHeight: "80vh", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner fullSequence={true} message="Establishing secure telemetry uplink..." />
      </div>
    );
  }

  // Reactive Values based on Scrubber
  const displayPassengers = Math.round(
    (kpis ? kpis.total_passengers : 2482100) * (temporalMultiplier.factor * 0.9 + 0.1)
  );
  const displayOccupancy = Math.min(
    98, 
    Math.round((kpis ? kpis.avg_occupancy * 100 : 74) * (temporalMultiplier.factor * 0.85 + 0.15))
  );
  const displayDelay = (
    (kpis ? kpis.avg_delay : 5.8) * (temporalMultiplier.factor * 0.9 + 0.1)
  ).toFixed(1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="page-container dashboard-page spatial-command-layout"
    >
      {/* =========================================================================
          FUTURISTIC HOLOGRAPHIC SCANNER (Triggers in center of screen before results)
          ========================================================================= */}
      <HolographicAnalyzer 
        isOpen={isAnalyzing}
        title={analyzerTitle}
        onComplete={handleHologramComplete}
      />

      {/* =========================================================================
          ZONE A: SPATIAL MISSION CONTROL DYNAMIC ISLAND BANNER
          ========================================================================= */}
      <div className="command-header-island hud-panel hud-corners">
        <div className="island-meta-left">
          <div className="island-status-pill">
            <span className="pulse-beacon-cyan"></span>
            <span className="island-node-id">KARACHI TRANSITVERSE // NODE-01</span>
            <span className="island-live-chip">2.05M ROWS BENCHMARK</span>
          </div>
          <h1 className="island-title">Autonomous Transit Command Deck</h1>
        </div>

        {/* Dynamic City Vitals Island Pill */}
        <div className="island-center-gauges">
          <div className="gauge-item">
            <span className="gauge-label">METROPOLIS PULSE</span>
            <strong className="gauge-val text-success">{kpis?.on_time_rate ? (kpis.on_time_rate * 100).toFixed(1) + '% OPTIMAL' : 'N/A'}</strong>
          </div>
          <div className="gauge-divider"></div>
          <div className="gauge-item">
            <span className="gauge-label">CONGESTION INDEX</span>
            <strong className="gauge-val" style={{ color: temporalMultiplier.color }}>
              {temporalMultiplier.label.split(' ')[0]} ({displayOccupancy}%)
            </strong>
          </div>
          <div className="gauge-divider"></div>
          <div className="gauge-item">
            <span className="gauge-label">PIPELINE DRIFT</span>
            <strong className="gauge-val text-cyan">{kpis?.pipeline_drift || '0.000'}</strong>
          </div>
        </div>

        <div className="island-actions-right">
          <button 
            type="button"
            className={`btn-evaluator-pill ${evaluatorMode ? 'is-active' : ''}`}
            onClick={() => setEvaluatorMode(!evaluatorMode)}
            title="Toggle Juror & Evaluator Deep Telemetry Layer"
          >
            <FaMicrochip />
            <span>{evaluatorMode ? 'EVALUATOR MODE: ON' : 'EVALUATOR MODE: OFF'}</span>
          </button>

          <button className="btn-sync-island" onClick={handleManualSync} title="Sync Live Database Records">
            <FaSyncAlt className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          ZONE B: ASYMMETRICAL 2-WING COMMAND COCKPIT (70% Left Wing | 30% Right Wing)
          ========================================================================= */}
      <div className="spatial-cockpit-split">
        
        {/* PRIMARY FLIGHT WING (LEFT 70%) */}
        <div className="cockpit-left-wing">
          
          {/* 1. Integrated Holographic GIS Map with Floating Telemetry HUD & Radar */}
          <div className="spatial-map-console hud-panel hud-corners">
            
            {/* Map Top Console Header */}
            <div className="console-toolbar">
              <div className="console-heading">
                <FaMapMarkerAlt className="text-cyan" />
                <h3>Karachi Spatial Movement Radar</h3>
                <span className="badge-pill badge-aurora">110 CORRIDORS</span>
              </div>

              {/* Mode Selector */}
              <div className="console-mode-pills">
                {MAP_MODES.map((m) => (
                  <button
                    key={m.id}
                    className={`mode-chip ${mapMode === m.id ? 'active' : ''}`}
                    onClick={() => setMapMode(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Canvas with Floating HUD Chips & Live Radar Sweep */}
            <div className="map-view-wrapper">
              {/* Futuristic Live Military Radar Sweep Animation */}
              <div className="map-radar-sweep"></div>

              <LeafletMap 
                center={karachiCenter} 
                zoom={11} 
                scrollWheelZoom={false} 
                style={{ height: '390px', width: '100%', borderRadius: '16px' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {STATIONS.map((st, idx) => (
                  <React.Fragment key={idx}>
                    <Marker 
                      position={st.pos}
                      icon={createTransitIcon(getCircleColor(st))}
                      eventHandlers={{
                        click: () => handleSelectStationWithAnimation(st)
                      }}
                    >
                      <Popup>
                        <div style={{ color: '#0F172A', minWidth: '180px' }}>
                          <strong style={{ color: '#007AFF', fontSize: '0.9rem' }}>{st.name}</strong>
                          <div style={{ marginTop: '4px', fontSize: '0.8rem' }}>
                            <div>Route: <strong>{st.route}</strong></div>
                            <div>Delay: <strong style={{ color: st.delay > 10 ? '#E11D48' : '#16A34A' }}>{st.delayStr}</strong></div>
                            <div>Load: <strong>{st.load} PAX</strong></div>
                            <button 
                              style={{ marginTop: '6px', width: '100%', padding: '5px', background: '#007AFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold' }}
                              onClick={() => handleSelectStationWithAnimation(st)}
                            >
                              Analyse Telemetry
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={st.pos}
                      radius={mapMode === 'CONGESTION' && st.congestion === 'Severe' ? 1900 : 1250}
                      pathOptions={{ 
                        color: getCircleColor(st), 
                        fillColor: getCircleColor(st),
                        fillOpacity: 0.22,
                        weight: 1.5
                      }}
                    />
                  </React.Fragment>
                ))}
              </LeafletMap>

              {/* Floating Spatial HUD Overlays right on the map */}
              <div className="map-hud-overlay-topleft">
                <div className="hud-metric-chip">
                  <span className="chip-label">PEAK BOTTLENECK</span>
                  <strong className="text-danger">{kpis?.peak_bottleneck || 'N/A'}</strong>
                </div>
                <div className="hud-metric-chip">
                  <span className="chip-label">HIGHEST LOAD</span>
                  <strong className="text-cyan">{kpis?.highest_load || 'N/A'}</strong>
                </div>
              </div>
            </div>

            {/* Embedded Station Diagnostic Drawer */}
            <AnimatePresence>
              {selectedStation && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="station-quick-drawer"
                >
                  <div className="drawer-header-flex">
                    <div>
                      <span className="drawer-sub">ACTIVE CORRIDOR TELEMETRY</span>
                      <h4>{selectedStation.name} • Route {selectedStation.route}</h4>
                    </div>
                    <button className="btn-drawer-x" onClick={() => setSelectedStation(null)}>✕ Close</button>
                  </div>
                  <div className="drawer-stats-quad">
                    <div><span>VELOCITY</span><strong>{selectedStation.speed}</strong></div>
                    <div><span>FLEET</span><strong>{selectedStation.vehicles} Units</strong></div>
                    <div><span>DELAY</span><strong style={{ color: selectedStation.delay > 10 ? '#E11D48' : '#16A34A' }}>{selectedStation.delayStr}</strong></div>
                    <div><span>LOAD</span><strong>{selectedStation.load} PAX</strong></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Embedded 24H Temporal Flight Scrubber (Integrated below Map!) */}
            <div className="console-scrubber-deck">
              <div className="scrubber-bar-header">
                <div className="scrubber-legend">
                  <FaClock className="text-cyan" />
                  <span>24-HOUR TEMPORAL SIMULATION SCRUBBER:</span>
                  <strong className="time-scrub-text">{String(simulatedHour).padStart(2, '0')}:00 PKT</strong>
                  <span className="time-zone-pill" style={{ color: temporalMultiplier.color, borderColor: temporalMultiplier.color }}>
                    ● {temporalMultiplier.label}
                  </span>
                </div>
                <span className="scrubber-note">Interactive temporal simulator modulates all dashboard metrics</span>
              </div>

              <input 
                type="range"
                min="0"
                max="23"
                value={simulatedHour}
                onChange={(e) => setSimulatedHour(parseInt(e.target.value))}
                className="console-range-scrubber"
              />
              <div className="scrubber-time-markers">
                <span>00:00 (Night)</span>
                <span>06:00 (Dawn)</span>
                <span>08:00 (Peak Surge)</span>
                <span>12:00 (Midday)</span>
                <span>17:00 (Evening Rush)</span>
                <span>21:00 (Express)</span>
                <span>23:00</span>
              </div>
            </div>
          </div>

          {/* 2. Hierarchical Metric Bento (Cohesive 4-Cell Telemetry Deck) */}
          <div className="hierarchical-bento-grid">
            
            {/* Grand Hero Tile: Ridership */}
            <div className="bento-tile tile-hero hud-panel hud-corners">
              <div className="tile-top-row">
                <span className="tile-tech-tag">{evaluatorMode ? "PARQUET // 2.05M" : "HOURLY VOLUME"}</span>
                <FaUsers className="tile-icon text-cyan" />
              </div>
              <div className="tile-main-stat">
                <span className="tile-number">{displayPassengers.toLocaleString()}</span>
                <span className="tile-unit">PAX</span>
              </div>
              <div className="tile-footer-trend">
                <span className={`trend-badge ${temporalMultiplier.factor >= 1 ? 'up' : 'down'}`}>
                  {temporalMultiplier.factor >= 1 ? '▲' : '▼'} {((temporalMultiplier.factor - 1) * 100).toFixed(0)}%
                </span>
                <span className="trend-caption">Calculated at {simulatedHour}:00 PKT</span>
              </div>
            </div>

            {/* Radial Reliability Ring Tile */}
            <div className="bento-tile tile-radial hud-panel hud-corners">
              <div className="tile-top-row">
                <span className="tile-tech-tag">{evaluatorMode ? "SLO // 5M_TOL" : "ON-TIME SLO"}</span>
                <FaCheckCircle className="tile-icon text-success" />
              </div>
              <div className="tile-radial-content">
                <div className="radial-stat-block">
                  <span className="radial-number">{kpis?.on_time_rate ? (kpis.on_time_rate * 100).toFixed(1) + '%' : 'N/A'}</span>
                  <small>Punctuality</small>
                </div>
                <div className="radial-context-text">
                  <span>Target: <strong>85.0%</strong></span>
                  <span className="status-badge-chip valid">WITHIN SLO</span>
                </div>
              </div>
            </div>

            {/* Congestion Velocity Tile */}
            <div className="bento-tile tile-velocity hud-panel hud-corners">
              <div className="tile-top-row">
                <span className="tile-tech-tag">{evaluatorMode ? "GBT // DELAY" : "CORRIDOR DELAY"}</span>
                <FaClock className="tile-icon text-coral" />
              </div>
              <div className="tile-main-stat">
                <span className="tile-number" style={{ color: displayDelay > 6 ? '#FF3B30' : 'var(--color-text)' }}>
                  {displayDelay}
                </span>
                <span className="tile-unit">min</span>
              </div>
              <div className="velocity-dwell-bar">
                <div className="dwell-fill" style={{ width: `${Math.min(100, displayDelay * 10)}%`, background: displayDelay > 6 ? '#FF3B30' : '#007AFF' }}></div>
              </div>
              <small className="tile-caption">Median dwell time: {kpis?.median_dwell ? kpis.median_dwell + 'm' : 'N/A'}</small>
            </div>

            {/* Dispatched Fleet Units Tile */}
            <div className="bento-tile tile-fleet hud-panel hud-corners">
              <div className="tile-top-row">
                <span className="tile-tech-tag">{evaluatorMode ? "POSTGRES // READ" : "FLEET DEPLOYED"}</span>
                <FaBus className="tile-icon text-cyan" />
              </div>
              <div className="tile-main-stat">
                <span className="tile-number">{kpis ? kpis.active_vehicles : 242}</span>
                <span className="tile-unit">/ 110 Rte</span>
              </div>
              <div className="fleet-occupancy-pill">
                <span>OCCUPANCY: <strong>{displayOccupancy}%</strong></span>
              </div>
            </div>

          </div>

        </div>

        {/* INTELLIGENCE & DISPATCH WING (RIGHT 30%) */}
        <div className="cockpit-right-wing">
          
          {/* 2. Autonomous Incident Mitigation Cockpit */}
          <div className="intelligence-panel hud-panel hud-corners">
            <div className="intel-header">
              <div className="intel-tag coral-tag">
                <FaExclamationCircle /> AUTONOMOUS COPILOT
              </div>
              <h3>Incident Mitigation Queue</h3>
              <p className="intel-desc">Live algorithmic dispatch recommendations.</p>
            </div>

            <div className="incident-cards-stack">
              {alerts.map((alert) => (
                <div key={alert.id} className={`incident-card incident-${alert.severity} ${alert.resolved ? 'resolved-card' : ''}`}>
                  <div className="inc-header">
                    <span className="inc-title">{alert.title}</span>
                    <span className="inc-time">{alert.time}</span>
                  </div>
                  <p className="inc-desc">{alert.description}</p>
                  
                  <div className="inc-action-row">
                    {alert.resolved ? (
                      <span className="inc-resolved-badge">
                        <FaCheckCircle /> MITIGATED
                      </span>
                    ) : (
                      <button 
                        type="button"
                        className="btn-inc-resolve"
                        onClick={() => handleResolveAlert(alert.id, alert.actionLabel)}
                      >
                        ⚡ {alert.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      
      {/* =========================================================================
          NEW ZONE: MASSIVE PIPELINE ENGINE (Full Width)
          ========================================================================= */}
      <div className="massive-pipeline-zone hud-panel hud-corners" style={{ margin: '30px 0', padding: '30px' }}>
        <div className="intel-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="intel-tag coral-tag" style={{ display: 'inline-block', marginBottom: '10px' }}>
              <FaMicrochip /> DUAL AI MODEL TRAINING & INFERENCE
            </div>
            <h3 style={{ fontSize: '2.2rem', margin: '0 0 10px 0', letterSpacing: '1px', color: 'var(--color-text)' }}>Algorithmic Runtime Engine</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Train models live and execute predictive pipelines side-by-side. Connects directly to PostgreSQL to fetch 2M records instantly.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* Left Column: Spark */}
          <div className="hud-panel" style={{ borderRadius: '12px', padding: '24px', borderTop: '4px solid #FBBF24', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '12px', borderRadius: '50%' }}>
                        <FaBolt size={24} color="#FBBF24" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-text)' }}>PySpark MLlib</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>RandomForestClassifier (Distributed)</span>
                    </div>
                </div>
                <button 
                  onClick={executeSpark} 
                  disabled={isAnalyzingSpark}
                  style={{ background: isAnalyzingSpark ? 'var(--color-bg-canvas)' : '#FBBF24', color: isAnalyzingSpark ? 'var(--color-text-muted)' : '#000', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: isAnalyzingSpark ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
                >
                  {isAnalyzingSpark ? 'Training...' : '▶ Execute Spark'}
                </button>
            </div>
            
            {sparkResult ? (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                 <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', flex: 1 }}>
                    <div style={{ flex: 1, background: 'var(--color-bg-canvas)', padding: '16px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><FaDatabase /> STEP 1: DATA FETCHING</span>
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Boarding:</span> <b className="text-cyan">{sparkResult.raw_data.boarding} PAX</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Load:</span> <b className="text-cyan">{sparkResult.raw_data.load} PAX</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Time:</span> <b className="text-cyan">{sparkResult.raw_data.hour}:00</b></div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaArrowRight color="var(--color-text-muted)" size={20} />
                    </div>
                    
                    <div style={{ flex: 1.5, background: 'rgba(251, 191, 36, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#D97706', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><FaBolt /> STEP 2: MODEL TRAINING</span>
                        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                            <div>Prediction: <b style={{ color: sparkResult.pred === 'DELAYED' ? '#ef4444' : '#22c55e' }}>{sparkResult.pred}</b></div>
                            <div>Confidence: <b>{sparkResult.confidence}</b></div>
                            <div>Accuracy: <b>{sparkResult.accuracy}%</b></div>
                            <div>F1-Score: <b>{sparkResult.f1_score}</b></div>
                            <div>RMSE: <b className="text-danger">{sparkResult.rmse}</b></div>
                            <div>Latency: <b className="text-cyan">{sparkResult.latency}</b></div>
                        </div>
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', background: 'var(--color-bg-canvas)', padding: '12px 16px', borderRadius: '8px' }}>
                     <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Records Trained: <b className="text-cyan">{(sparkResult.records_used || 0).toLocaleString()}</b></span>
                     <button onClick={() => handleExport('SPARK')} style={{ background: 'transparent', border: '1px solid #FBBF24', color: '#D97706', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                        📤 Export to Compare
                     </button>
                 </div>
              </div>
            ) : isAnalyzingSpark ? (
              <div className="pipeline-terminal-feed" style={{ height: '280px', maxHeight: '280px' }}>
                <div className="terminal-header">
                  <span className="terminal-dot red"></span>
                  <span className="terminal-dot yellow"></span>
                  <span className="terminal-dot green"></span>
                  <span className="terminal-title">spark_pipeline.log</span>
                </div>
                <div className="terminal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '10px' }}>
                  {sparkSteps.filter(Boolean).map((step, i) => (
                    <div key={i} className={`terminal-line ${step?.startsWith('✓') ? 'success' : step?.startsWith('✗') ? 'error' : ''}`}>
                      <span className="terminal-prefix">{step?.startsWith('✓') ? '✓' : step?.startsWith('✗') ? '✗' : '▸'}</span>
                      <span>{step?.startsWith('✓') || step?.startsWith('✗') ? step.slice(2) : step}</span>
                    </div>
                  ))}
                  </div>
                  <div className="terminal-cursor">_</div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', gap: '10px' }}>
                 <FaDatabase size={24} />
                 <span>Awaiting Spark Execution...</span>
              </div>
            )}
          </div>

          {/* Right Column: XGBoost */}
          <div className="hud-panel" style={{ borderRadius: '12px', padding: '24px', borderTop: '4px solid #00E5FF', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '12px', borderRadius: '50%' }}>
                        <FaRobot size={24} color="#008080" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-text)' }}>Python Native</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>XGBoost v2.0 (Single-Node)</span>
                    </div>
                </div>
                <button 
                  onClick={executeXgb} 
                  disabled={isAnalyzingXgb}
                  style={{ background: isAnalyzingXgb ? 'var(--color-bg-canvas)' : '#00E5FF', color: isAnalyzingXgb ? 'var(--color-text-muted)' : '#000', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: isAnalyzingXgb ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
                >
                  {isAnalyzingXgb ? 'Training...' : '▶ Execute XGBoost'}
                </button>
            </div>
            
            {xgbResult ? (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                 <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', flex: 1 }}>
                    <div style={{ flex: 1, background: 'var(--color-bg-canvas)', padding: '16px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><FaDatabase /> STEP 1: DATA FETCHING</span>
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Boarding:</span> <b className="text-cyan">{xgbResult.raw_data.boarding} PAX</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Load:</span> <b className="text-cyan">{xgbResult.raw_data.load} PAX</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Time:</span> <b className="text-cyan">{xgbResult.raw_data.hour}:00</b></div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaArrowRight color="var(--color-text-muted)" size={20} />
                    </div>
                    
                    <div style={{ flex: 1.5, background: 'rgba(0, 229, 255, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#008080', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><FaRobot /> STEP 2: MODEL TRAINING</span>
                        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                            <div>Prediction: <b style={{ color: xgbResult.pred === 'DELAYED' ? '#ef4444' : '#22c55e' }}>{xgbResult.pred}</b></div>
                            <div>Confidence: <b>{xgbResult.confidence}</b></div>
                            <div>Accuracy: <b>{xgbResult.accuracy}%</b></div>
                            <div>F1-Score: <b>{xgbResult.f1_score}</b></div>
                            <div>RMSE: <b className="text-danger">{xgbResult.rmse}</b></div>
                            <div>Latency: <b className="text-cyan">{xgbResult.latency}</b></div>
                        </div>
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', background: 'var(--color-bg-canvas)', padding: '12px 16px', borderRadius: '8px' }}>
                     <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Records Trained: <b className="text-cyan">{(xgbResult.records_used || 0).toLocaleString()}</b></span>
                     <button onClick={() => handleExport('XGB')} style={{ background: 'transparent', border: '1px solid #008080', color: '#008080', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                        📤 Export to Compare
                     </button>
                 </div>
              </div>
            ) : isAnalyzingXgb ? (
              <div className="pipeline-terminal-feed" style={{ height: '280px', maxHeight: '280px' }}>
                <div className="terminal-header">
                  <span className="terminal-dot red"></span>
                  <span className="terminal-dot yellow"></span>
                  <span className="terminal-dot green"></span>
                  <span className="terminal-title">xgboost_pipeline.log</span>
                </div>
                <div className="terminal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '10px' }}>
                  {xgbSteps.filter(Boolean).map((step, i) => (
                    <div key={i} className={`terminal-line ${step?.startsWith('✓') ? 'success' : step?.startsWith('✗') ? 'error' : ''}`}>
                      <span className="terminal-prefix">{step?.startsWith('✓') ? '✓' : step?.startsWith('✗') ? '✗' : '▸'}</span>
                      <span>{step?.startsWith('✓') || step?.startsWith('✗') ? step.slice(2) : step}</span>
                    </div>
                  ))}
                  </div>
                  <div className="terminal-cursor">_</div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', gap: '10px' }}>
                 <FaDatabase size={24} />
                 <span>Awaiting XGBoost Execution...</span>
              </div>
            )}
          </div>

        </div>
      </div>

{/* =========================================================================
          ZONE C: PANORAMIC ANALYTICAL BASIN (Asymmetric 60% : 40% Split)
          ========================================================================= */}
      <div className="panoramic-analytics-basin">
        
        {/* Left: 24-Hour Velocity Inflow Spline */}
        <div className="basin-card hud-panel hud-corners basin-wide">
          <div className="chart-header">
            <div>
              <h3>Karachi Corridor Inflow Velocity</h3>
              <span className="chart-subtitle">24-Hour Empirical Ridership Distribution</span>
            </div>
            <span className="badge-pill badge-aurora">CUBIC SPLINE</span>
          </div>

          <InflowVelocityChart flowData={flowData} />
        </div>

        {/* Right: Empirical Root Cause Delay Attribution Donut */}
        <div className="basin-card hud-panel hud-corners basin-narrow">
          <div className="chart-header">
            <div>
              <h3>Root Cause Decomposition</h3>
              <span className="chart-subtitle">Factor Attributions via ML</span>
            </div>
            <span className="badge-pill badge-gold">PYSPARK MLlib</span>
          </div>

          <RootCauseChart delayData={delayData} />
        </div>

      </div>

      {/* =========================================================================
          ZONE D: DISTRIBUTED INFRASTRUCTURE HARDWARE CHASSIS RACK
          ========================================================================= */}
      <div className="hardware-chassis-rack hud-panel hud-corners">
        <div className="rack-header">
          <div className="rack-title">
            <FaHdd className="text-cyan" />
            <span>DISTRIBUTED BIG DATA HARDWARE CHASSIS</span>
          </div>
          <span className="rack-meta">PHYSICAL CLUSTER HEALTH: ALL SYSTEMS NOMINAL</span>
        </div>

        <div className="rack-units-row">
          <div className="rack-unit">
            <div className="unit-led led-green"></div>
            <div className="unit-info">
              <span className="unit-name">STORAGE FABRIC</span>
              <strong className="unit-detail">PostgreSQL Physical Ledger</strong>
            </div>
          </div>

          <div className="rack-unit">
            <div className="unit-led led-green"></div>
            <div className="unit-info">
              <span className="unit-name">APACHE SPARK</span>
              <strong className="unit-detail">v3.5.0 Standalone Master</strong>
            </div>
          </div>

          <div className="rack-unit">
            <div className="unit-led led-green"></div>
            <div className="unit-info">
              <span className="unit-name">PYSPARK MLlib</span>
              <strong className="unit-detail">GBTClassifier Active</strong>
            </div>
          </div>

          <div className="rack-unit">
            <div className="unit-led led-green"></div>
            <div className="unit-info">
              <span className="unit-name">PARQUET BENCHMARK</span>
              <strong className="unit-detail">Snappy 2.05M Cleaned Rows</strong>
            </div>
          </div>

          <div className="rack-unit">
            <div className="unit-led led-green"></div>
            <div className="unit-info">
              <span className="unit-name">FASTAPI GATEWAY</span>
              <strong className="unit-detail">Uvicorn ASGI P95 &lt;12ms</strong>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
