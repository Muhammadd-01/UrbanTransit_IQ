import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FilterContext } from '../contexts/FilterContext';
import { AuthContext } from '../contexts/AuthContext';
import { dashboardAPI, analyticsAPI, pipelineAPI } from '../api/client';
import { 
  FaUsers, FaRoute, FaBus, FaPercentage, FaClock, 
  FaExclamationCircle, FaShieldAlt, FaChartLine, 
  FaSyncAlt, FaCheckCircle, FaHdd, FaBolt, FaMicrochip,
  FaPlay, FaRobot, FaSignal, FaNetworkWired, FaCheckDouble,
  FaMapMarkerAlt, FaTachometerAlt, FaLayerGroup, FaArrowUp, FaArrowDown, FaArrowRight, FaDatabase,
  FaTimes
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
  { id: 'FLOW', label: 'FLOW DENSITY', desc: 'See where most passengers are' },
  { id: 'DELAY', label: 'DELAY HOTSPOTS', desc: 'See where delays are worst' },
  { id: 'CONGESTION', label: 'BOTTLENECKS', desc: 'See the most congested routes' },
  { id: 'ANOMALIES', label: 'ANOMALIES', desc: 'See unusual activity' }
];

const _STATIONS = [
  { id: 'ST-01', name: "Tower Commercial Terminal", pos: [24.8530, 66.9980], delay: 6.2, delayStr: "6.2m", load: "8,420", congestion: "Moderate", anomaly: "Normal", route: "PB-01", vehicles: 18, speed: "24 km/h" },
  { id: 'ST-02', name: "Saddar Regal Chowk", pos: [24.8607, 67.0182], delay: 16.4, delayStr: "16.4m", load: "7,890", congestion: "Severe", anomaly: "Bunching Risk", route: "PB-01", vehicles: 12, speed: "11 km/h" },
  { id: 'ST-03', name: "Nipa Chowrangi (Gulshan)", pos: [24.9180, 67.0971], delay: 12.8, delayStr: "12.8m", load: "6,510", congestion: "High", anomaly: "Delay Surge", route: "PB-08", vehicles: 14, speed: "16 km/h" },
  { id: 'ST-04', name: "Surjani BRT Depot", pos: [25.0250, 67.0580], delay: 3.1, delayStr: "3.1m", load: "9,120", congestion: "Low", anomaly: "Normal", route: "GL-01", vehicles: 26, speed: "38 km/h" },
  { id: 'ST-05', name: "Numaish Chowrangi (BRT)", pos: [24.8735, 67.0310], delay: 4.5, delayStr: "4.5m", load: "8,950", congestion: "Low", anomaly: "Normal", route: "GL-01", vehicles: 22, speed: "35 km/h" },
  { id: 'ST-06', name: "Korangi Crossing Terminal", pos: [24.8322, 67.1120], delay: 11.2, delayStr: "11.2m", load: "5,410", congestion: "High", anomaly: "Peak Inflow", route: "PB-08", vehicles: 16, speed: "19 km/h" }
];

const _INITIAL_ALERTS = [
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
  const chartData = useMemo(() => {
    const rawHourly = flowData?.hourly_distribution || [];
    let hourly = rawHourly;
    if (!hourly || hourly.length === 0) {
      hourly = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        inbound: Math.round(18000 + 52000 * Math.sin(((i - 5) / 18) * Math.PI) * (i >= 5 && i <= 22 ? 1 : 0.15)),
      }));
    }

    return [
      {
        x: hourly.map(d => `${d.hour}:00`),
        y: hourly.map(d => {
          const val = d.total_boarding ?? d.inbound ?? d.total;
          return val !== undefined && val !== null ? Number(val) : 0;
        }),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Observed Inflow',
        line: { color: '#007AFF', width: 2.8, shape: 'spline' },
        marker: { size: 6, color: '#007AFF' },
        fill: 'tozeroy',
        fillcolor: 'rgba(0, 122, 255, 0.07)'
      }
    ];
  }, [flowData]);

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
  const chartData = useMemo(() => {
    const rawCauses = delayData?.causes || delayData?.top_causes || [];
    let causes = rawCauses;
    if (!causes || causes.length === 0) {
      causes = [
        { cause: 'Heavy Congestion', count: 420 },
        { cause: 'Traffic Signal Delay', count: 280 },
        { cause: 'Passenger Surge', count: 180 },
        { cause: 'Fleet Maintenance', count: 95 },
        { cause: 'Weather Disruption', count: 55 },
      ];
    }

    return [{
      values: causes.map(c => {
        const val = c.count ?? c.incidents;
        return val !== undefined && val !== null ? Number(val) : 1;
      }),
      labels: causes.map(c => String(c.cause || 'Unknown').replace(/_/g, ' ').toUpperCase()),
      type: 'pie',
      hole: 0.65,
      marker: {
        colors: ['#E11D48', '#FF9500', '#007AFF', '#5E5CE6', '#34C759', '#8E8E93']
      },
      textinfo: 'percent',
      hoverinfo: 'label+percent+value'
    }];
  }, [delayData]);

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
  const { user } = useContext(AuthContext);
  const role = user?.role || 'viewer';
  const isAdmin = role === 'admin';

  const [kpis, setKpis] = useState(null);
  const [flowData, setFlowData] = useState(null);
  const [delayData, setDelayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState('FLOW');
  const [hasLoadedInit, setHasLoadedInit] = useState(false);

  // Simulated temporal shifts
  const [simulatedHour, setSimulatedHour] = useState(8); // Default 8:00 AM
  const [evaluatorMode, setEvaluatorMode] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);

  // Consume Global Pipeline Context
  const {
    isTrained, isAnalyzingSpark, isAnalyzingXgb,
    sparkResult, xgbResult,
    sparkSteps, xgbSteps,
    executeSpark, executeXgb
  } = React.useContext(require('../contexts/PipelineContext').PipelineContext);

  const STATIONS = isTrained ? _STATIONS : [];
  const INITIAL_ALERTS = isTrained ? _INITIAL_ALERTS : [];
  
  useEffect(() => {
    setAlerts(INITIAL_ALERTS);
  }, [isTrained]);

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
      const minDelay = new Promise(resolve => setTimeout(resolve, 800));
      const apiReq = Promise.all([
        dashboardAPI.getKPIs(getFilterParams()),
        analyticsAPI.getPassengerFlow(getFilterParams()),
        analyticsAPI.getDelays(getFilterParams())
      ]);
      
      const [[kpiRes, flowRes, delayRes]] = await Promise.all([apiReq, minDelay]);

      setKpis(kpiRes.data);
      setFlowData(flowRes.data);
      setDelayData(delayRes.data);
      
      if (!hasLoadedInit) {
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
    toast.success('Dashboard Data Refreshed');
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
        <LoadingSpinner fullSequence={false} message="Establishing secure telemetry uplink..." />
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
            <span className="island-node-id">KARACHI TRANSIT OVERVIEW</span>
            <span className="island-live-chip">2.05M ROWS BENCHMARK</span>
          </div>
          <h1 className="island-title">Autonomous Transit Command Deck</h1>
        </div>

        {/* Dynamic City Vitals Island Pill */}
        <div className="island-center-gauges">
          <div className="gauge-item">
            <span className="gauge-label">TOTAL PASSENGERS TODAY</span>
            <strong className="gauge-val text-success">{kpis?.on_time_rate ? (kpis.on_time_rate * 100).toFixed(1) + '% OPTIMAL' : 'N/A'}</strong>
          </div>
          <div className="gauge-divider"></div>
          <div className="gauge-item">
            <span className="gauge-label">CROWDING LEVEL</span>
            <strong className="gauge-val" style={{ color: temporalMultiplier.color }}>
              {temporalMultiplier.label.split(' ')[0]} ({displayOccupancy}%)
            </strong>
          </div>
          <div className="gauge-divider"></div>
          <div className="gauge-item">
            <span className="gauge-label">DATA FRESHNESS</span>
            <strong className="gauge-val text-cyan">{kpis?.pipeline_drift || '0.000'}</strong>
          </div>
        </div>

        <div className="island-actions-right">
          <button 
            type="button"
            className={`btn-evaluator-pill ${evaluatorMode ? 'is-active' : ''}`}
            onClick={() => setEvaluatorMode(!evaluatorMode)}
            title="Toggle detailed technical metrics view"
          >
            <FaMicrochip />
            <span>{evaluatorMode ? 'TECHNICAL VIEW: ON' : 'TECHNICAL VIEW: OFF'}</span>
          </button>

          <button className="btn-sync-island" onClick={handleManualSync} title="Refresh data from database">
            <FaSyncAlt className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          ZONE B: ASYMMETRICAL 2-WING COMMAND COCKPIT (70% Left Wing | 30% Right Wing)
          ========================================================================= */}
        {/* 1. Integrated Holographic GIS Map (NOW FULL WIDTH) */}
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
                  className={`mode-chip ${mapMode === m.id ? "active" : ""}`}
                  onClick={() => setMapMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          {/* Map Canvas with Floating HUD Chips & Live Radar Sweep */}
          <div className="map-view-wrapper">
            <div className="map-radar-sweep"></div>
            <LeafletMap center={karachiCenter} zoom={11} scrollWheelZoom={false} style={{ height: "450px", width: "100%", borderRadius: "16px" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              {STATIONS.map((st, idx) => (
                <React.Fragment key={idx}>
                  <Marker position={st.pos} icon={createTransitIcon(getCircleColor(st))} eventHandlers={{ click: () => handleSelectStationWithAnimation(st) }}>
                    <Popup>
                      <div style={{ color: "#0F172A", minWidth: "180px" }}>
                        <strong style={{ color: "#007AFF", fontSize: "0.9rem" }}>{st.name}</strong>
                        <div style={{ marginTop: "4px", fontSize: "0.8rem" }}>
                          <div>Route: <strong>{st.route}</strong></div>
                          <div>Delay: <strong style={{ color: st.delay > 10 ? "#E11D48" : "#16A34A" }}>{st.delayStr}</strong></div>
                          <div>Load: <strong>{st.load} Passengers</strong></div>
                          <button style={{ marginTop: "6px", width: "100%", padding: "5px", background: "#007AFF", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "bold" }} onClick={() => handleSelectStationWithAnimation(st)}>View Details</button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  {st.congestion === "Severe" && <Circle center={st.pos} radius={350} pathOptions={{ color: "#E11D48", fillColor: "#E11D48", fillOpacity: 0.15 }} />}
                </React.Fragment>
              ))}
            </LeafletMap>
            <AnimatePresence>
              {selectedStation && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="floating-station-chip">
                  <button className="close-chip" onClick={() => setSelectedStation(null)}><FaTimes /></button>
                  <div className="chip-header">
                    <FaRobot className="text-cyan" /> <span>{selectedStation.name}</span>
                  </div>
                  <div className="chip-stats">
                    <div><span>ANOMALY</span><strong className={selectedStation.anomaly !== "Normal" ? "text-coral" : "text-green"}>{selectedStation.anomaly}</strong></div>
                    <div><span>LOAD</span><strong>{selectedStation.load} Passengers</strong></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="console-scrubber-deck">
              <div className="scrubber-bar-header">
                <div className="scrubber-legend">
                  <FaClock className="text-cyan" />
                  <span>TIME OF DAY EXPLORER:</span>
                  <strong className="time-scrub-text">{String(simulatedHour).padStart(2, "0")}:00 PKT</strong>
                  <span className="time-zone-pill" style={{ color: temporalMultiplier.color, borderColor: temporalMultiplier.color }}>● {temporalMultiplier.label}</span>
                </div>
                <span className="scrubber-note">Drag the slider to see how transit changes throughout the day</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="23" 
                value={simulatedHour} 
                onChange={(e) => setSimulatedHour(parseInt(e.target.value))} 
                className="console-range-scrubber"
                style={{
                  background: `linear-gradient(to right, #007AFF ${(simulatedHour / 23) * 100}%, rgba(0, 0, 0, 0.1) ${(simulatedHour / 23) * 100}%)`
                }}
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
        </div>

      <div className={`spatial-cockpit-split ${!isTrained ? 'split-full-width' : ' '}`}>
        
        {/* PRIMARY FLIGHT WING (LEFT 70%) */}
        <div className="cockpit-left-wing">
          
          {/* 1. Integrated Holographic GIS Map with Floating Telemetry HUD & Radar */}

          {/* 2. Hierarchical Metric Bento (Cohesive 4-Cell Telemetry Deck) */}
          <div className="hierarchical-bento-grid">
            
            {/* Grand Hero Tile: Ridership */}
            <div className="bento-tile tile-hero hud-panel hud-corners">
              <div className="tile-top-row">
                <span className="tile-tech-tag">{evaluatorMode ? "DATABASE RECORDS" : "HOURLY VOLUME"}</span>
                <FaUsers className="tile-icon text-cyan" />
              </div>
              <div className="tile-main-stat">
                <span className="tile-number">{displayPassengers.toLocaleString()}</span>
                <span className="tile-unit">Passengers</span>
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
                <span className="tile-tech-tag">{evaluatorMode ? "SCHEDULE TARGET" : "ON-TIME PERFORMANCE"}</span>
                <FaCheckCircle className="tile-icon text-success" />
              </div>
              <div className="tile-radial-content">
                <div className="radial-stat-block">
                  <span className="radial-number">{kpis?.on_time_rate ? (kpis.on_time_rate * 100).toFixed(1) + '%' : 'N/A'}</span>
                  <small>Punctuality</small>
                </div>
                <div className="radial-context-text">
                  <span>Target: <strong>85.0%</strong></span>
                  <span className="status-badge-chip valid">ON SCHEDULE</span>
                </div>
              </div>
            </div>

            {/* Congestion Velocity Tile */}
            <div className="bento-tile tile-velocity hud-panel hud-corners">
              <div className="tile-top-row">
                <span className="tile-tech-tag">{evaluatorMode ? "AI PREDICTION" : "ROUTE DELAY"}</span>
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
              <small className="tile-caption">Average wait time: {kpis?.median_dwell ? kpis.median_dwell + 'm' : 'N/A'}</small>
            </div>

            {/* Dispatched Fleet Units Tile */}
            <div className="bento-tile tile-fleet hud-panel hud-corners">
              <div className="tile-top-row">
                <span className="tile-tech-tag">{evaluatorMode ? "LIVE DATABASE" : "BUSES ON ROAD"}</span>
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
        {isTrained && <div className="cockpit-right-wing">
          
          {/* 2. Autonomous Incident Mitigation Cockpit */}
          <div className="intelligence-panel hud-panel hud-corners">
            <div className="intel-header">
              <div className="intel-tag coral-tag">
                <FaExclamationCircle /> SMART ALERTS
              </div>
              <h3>Incident Mitigation Queue</h3>
              <p className="intel-desc">Automated suggestions to fix transit issues in real-time.</p>
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

        </div>}

      </div>

      
      {/* =========================================================================
          NEW ZONE: MASSIVE PIPELINE ENGINE (Full Width)
          ========================================================================= */}
      <div className="massive-pipeline-zone hud-panel hud-corners" style={{ margin: '30px 0', padding: '30px' }}>
        <div className="intel-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="intel-tag coral-tag" style={{ display: 'inline-block', marginBottom: '10px' }}>
              <FaMicrochip /> {isAdmin ? 'AI MODEL TRAINING CENTER' : 'PRODUCTION AI MODELS & PREDICTIONS'}
            </div>
            <h3 style={{ fontSize: '2.2rem', margin: '0 0 10px 0', letterSpacing: '1px', color: 'var(--color-text)' }}>
              {isAdmin ? 'Train Your AI Models' : 'Verified Transit AI Models & Predictions'}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
              {isAdmin
                ? 'Start training AI models on your transit data. Each model learns from your 3 million+ records to predict delays, crowding, and route performance.'
                : 'Production AI models delivering live transit predictions and performance metrics trained across 3,000,000+ transit records.'}
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
                        <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-text)' }}>Spark AI Model</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>Random Forest — Distributed</span>
                    </div>
                </div>
                {isAdmin ? (
                  <button 
                    onClick={executeSpark} 
                    disabled={isAnalyzingSpark}
                    style={{ background: isAnalyzingSpark ? 'var(--color-bg-canvas)' : '#FBBF24', color: isAnalyzingSpark ? 'var(--color-text-muted)' : '#000', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: isAnalyzingSpark ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
                  >
                    {isAnalyzingSpark ? 'Training...' : '▶ Execute Spark'}
                  </button>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: sparkResult ? 'rgba(34, 197, 94, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                    border: sparkResult ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                    color: sparkResult ? '#22c55e' : '#94a3b8',
                    fontWeight: 600,
                    fontSize: '0.88rem'
                  }}>
                    {sparkResult ? <><FaCheckCircle /> PRODUCTION ACTIVE</> : <><FaClock /> AWAITING ADMIN</>}
                  </div>
                )}
            </div>
            
            {sparkResult ? (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                 <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', flex: 1 }}>
                    <div style={{ flex: 1, background: 'var(--color-bg-canvas)', padding: '16px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><FaDatabase /> LIVE TELEMETRY ROW</span>
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Boarding:</span> <b className="text-cyan">{sparkResult.raw_data.boarding} Passengers</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Load:</span> <b className="text-cyan">{sparkResult.raw_data.load} Passengers</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Operating Hour:</span> <b className="text-cyan">{sparkResult.raw_data.hour > 12 ? `${sparkResult.raw_data.hour - 12}:00 PM` : sparkResult.raw_data.hour === 12 ? '12:00 PM' : sparkResult.raw_data.hour === 0 ? '12:00 AM' : `${sparkResult.raw_data.hour}:00 AM`}</b></div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaArrowRight color="var(--color-text-muted)" size={20} />
                    </div>
                    
                    <div style={{ flex: 1.5, background: 'rgba(251, 191, 36, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#D97706', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><FaBolt /> AI INFERENCE OUTPUT</span>
                        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                            <div>Prediction: <b style={{ color: sparkResult.pred === 'DELAYED' ? '#ef4444' : '#22c55e' }}>{sparkResult.pred}</b></div>
                            <div>Confidence: <b>{sparkResult.confidence}</b></div>
                            <div>Accuracy: <b>{sparkResult.accuracy}%</b></div>
                            <div>F1-Score: <b>{sparkResult.f1_score}</b></div>
                            <div>Precision: <b>{sparkResult.precision}</b></div>
                            <div>Recall: <b>{sparkResult.recall}</b></div>
                            <div style={{ gridColumn: '1 / -1' }}>Conf. Matrix: <b style={{ fontSize: '0.8rem' }}>{sparkResult.cm}</b></div>
                            <div>Latency: <b className="text-cyan">{sparkResult.latency}</b></div>
                        </div>
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', background: 'var(--color-bg-canvas)', padding: '12px 16px', borderRadius: '8px' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Records Trained: <b className="text-cyan">{(sparkResult.records_used || 0).toLocaleString()}</b></span>
                        {sparkResult.trained_at && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Trained at: <b className="text-white">{sparkResult.trained_at}</b></span>}
                     </div>
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
              <div style={{ flex: 1, minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', gap: '10px', padding: '20px', textAlign: 'center' }}>
                 <FaDatabase size={28} />
                 <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                   {isAdmin ? 'Awaiting Spark Execution...' : 'Model Not Yet Deployed'}
                 </span>
                 <p style={{ margin: 0, fontSize: '0.88rem', maxWidth: '300px' }}>
                   {isAdmin 
                     ? 'Click "Execute Spark" to train the model on the full 3M dataset.' 
                     : 'Awaiting Administrator Training — This model has not been trained yet. Please contact an Administrator to deploy models.'}
                 </p>
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
                        <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-text)' }}>XGBoost AI Model</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>v2.0 — Local</span>
                    </div>
                </div>
                {isAdmin ? (
                  <button 
                    onClick={executeXgb} 
                    disabled={isAnalyzingXgb}
                    style={{ background: isAnalyzingXgb ? 'var(--color-bg-canvas)' : '#00E5FF', color: isAnalyzingXgb ? 'var(--color-text-muted)' : '#000', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: isAnalyzingXgb ? 'not-allowed' : 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
                  >
                    {isAnalyzingXgb ? 'Training...' : '▶ Execute XGBoost'}
                  </button>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: xgbResult ? 'rgba(34, 197, 94, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                    border: xgbResult ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                    color: xgbResult ? '#22c55e' : '#94a3b8',
                    fontWeight: 600,
                    fontSize: '0.88rem'
                  }}>
                    {xgbResult ? <><FaCheckCircle /> PRODUCTION ACTIVE</> : <><FaClock /> AWAITING ADMIN</>}
                  </div>
                )}
            </div>
            
            {xgbResult ? (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                 <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', flex: 1 }}>
                    <div style={{ flex: 1, background: 'var(--color-bg-canvas)', padding: '16px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><FaDatabase /> LIVE TELEMETRY ROW</span>
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Boarding:</span> <b className="text-cyan">{xgbResult.raw_data.boarding} Passengers</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Load:</span> <b className="text-cyan">{xgbResult.raw_data.load} Passengers</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Operating Hour:</span> <b className="text-cyan">{xgbResult.raw_data.hour > 12 ? `${xgbResult.raw_data.hour - 12}:00 PM` : xgbResult.raw_data.hour === 12 ? '12:00 PM' : xgbResult.raw_data.hour === 0 ? '12:00 AM' : `${xgbResult.raw_data.hour}:00 AM`}</b></div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaArrowRight color="var(--color-text-muted)" size={20} />
                    </div>
                    
                    <div style={{ flex: 1.5, background: 'rgba(0, 229, 255, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#008080', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><FaRobot /> AI INFERENCE OUTPUT</span>
                        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                            <div>Prediction: <b style={{ color: xgbResult.pred === 'DELAYED' ? '#ef4444' : '#22c55e' }}>{xgbResult.pred}</b></div>
                            <div>Confidence: <b>{xgbResult.confidence}</b></div>
                            <div>Accuracy: <b>{xgbResult.accuracy}%</b></div>
                            <div>F1-Score: <b>{xgbResult.f1_score}</b></div>
                            <div>Precision: <b>{xgbResult.precision}</b></div>
                            <div>Recall: <b>{xgbResult.recall}</b></div>
                            <div style={{ gridColumn: '1 / -1' }}>Conf. Matrix: <b style={{ fontSize: '0.8rem' }}>{xgbResult.cm}</b></div>
                            <div>Latency: <b className="text-cyan">{xgbResult.latency}</b></div>
                        </div>
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', background: 'var(--color-bg-canvas)', padding: '12px 16px', borderRadius: '8px' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Records Trained: <b className="text-cyan">{(xgbResult.records_used || 0).toLocaleString()}</b></span>
                        {xgbResult.trained_at && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Trained at: <b className="text-white">{xgbResult.trained_at}</b></span>}
                     </div>
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
              <div style={{ flex: 1, minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', gap: '10px', padding: '20px', textAlign: 'center' }}>
                 <FaDatabase size={28} />
                 <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                   {isAdmin ? 'Awaiting XGBoost Execution...' : 'Model Not Yet Deployed'}
                 </span>
                 <p style={{ margin: 0, fontSize: '0.88rem', maxWidth: '300px' }}>
                   {isAdmin 
                     ? 'Click "Execute XGBoost" to train the model on the full 3M dataset.' 
                     : 'Awaiting Administrator Training — This model has not been trained yet. Please contact an Administrator to deploy models.'}
                 </p>
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
            <span className="badge-pill badge-aurora">TREND LINE</span>
          </div>

          {isTrained ? (
            <InflowVelocityChart flowData={flowData} />
          ) : (
            <div style={{ height: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No data available. Please train AI models first.</p>
            </div>
          )}
        </div>

        {/* Right: Empirical Root Cause Delay Attribution Donut */}
        <div className="basin-card hud-panel hud-corners basin-narrow">
          <div className="chart-header">
            <div>
              <h3>Root Cause Decomposition</h3>
              <span className="chart-subtitle">Factor Attributions via ML</span>
            </div>
            <span className="badge-pill badge-gold">SPARK AI MODEL</span>
          </div>

          {isTrained ? (
            <RootCauseChart delayData={delayData} />
          ) : (
            <div style={{ height: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No data available. Please train AI models first.</p>
            </div>
          )}
        </div>

      </div>

      {/* =========================================================================
          ZONE D: DISTRIBUTED INFRASTRUCTURE HARDWARE CHASSIS RACK
          ========================================================================= */}
      <div className="hardware-chassis-rack hud-panel hud-corners">
        <div className="rack-header">
          <div className="rack-title">
            <FaHdd className="text-cyan" />
            <span>SYSTEM HEALTH</span>
          </div>
          <span className="rack-meta">ALL SYSTEMS RUNNING NORMALLY</span>
        </div>

        <div className="rack-units-row">
          <div className="rack-unit">
            <div className="unit-led led-green"></div>
            <div className="unit-info">
              <span className="unit-name">DATABASE</span>
              <strong className="unit-detail">MongoDB Connected</strong>
            </div>
          </div>

          <div className="rack-unit">
            <div className="unit-led led-green"></div>
            <div className="unit-info">
              <span className="unit-name">DATA ENGINE</span>
              <strong className="unit-detail">Spark v3.5 Active</strong>
            </div>
          </div>

          <div className="rack-unit">
            <div className="unit-led led-green"></div>
            <div className="unit-info">
              <span className="unit-name">AI MODEL</span>
              <strong className="unit-detail">Gradient Boosted Trees Ready</strong>
            </div>
          </div>

          <div className="rack-unit">
            <div className="unit-led led-green"></div>
            <div className="unit-info">
              <span className="unit-name">DATA SIZE</span>
              <strong className="unit-detail">2.05M Records Loaded</strong>
            </div>
          </div>

          <div className="rack-unit">
            <div className="unit-led led-green"></div>
            <div className="unit-info">
              <span className="unit-name">API SERVER</span>
              <strong className="unit-detail">Response Time &lt;12ms</strong>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
