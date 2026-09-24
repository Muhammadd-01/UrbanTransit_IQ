import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/client';
import { FaRoute, FaCheckCircle, FaExclamationTriangle, FaStar, FaTimes, FaBus, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './RouteIntelligence.css';

const DETAILED_ROUTES = [
  { route_id: 'PB-01', route_name: 'Peoples Bus Line 1 (Model Colony ⇄ Tower)', trips: 420, passengers: '48,200', avg_delay: '16.4m', on_time: '78.2%', utilization: '94.0%', headway: '6.5m', bunching: 'HIGH (0.78)', demand: 'SURGE', status: 'REQUIRES_ATTENTION', composite_score: 72.4 },
  { route_id: 'GL-01', route_name: 'Green Line BRT (Surjani Depot ⇄ Numaish)', trips: 640, passengers: '62,800', avg_delay: '4.2m', on_time: '94.8%', utilization: '88.5%', headway: '4.0m', bunching: 'LOW (0.12)', demand: 'HIGH', status: 'EXCELLENT', composite_score: 94.6 },
  { route_id: 'PB-08', route_name: 'Peoples Bus Line 8 (Korangi Crossing ⇄ Saddar)', trips: 380, passengers: '38,900', avg_delay: '11.8m', on_time: '82.6%', utilization: '86.2%', headway: '8.0m', bunching: 'MODERATE (0.42)', demand: 'NORMAL', status: 'GOOD', composite_score: 84.1 },
  { route_id: 'LB-04', route_name: 'Liaquatabad Local Mixed (Dak Khana ⇄ Bolton)', trips: 290, passengers: '26,400', avg_delay: '14.2m', on_time: '79.1%', utilization: '82.0%', headway: '12.0m', bunching: 'HIGH (0.64)', demand: 'NORMAL', status: 'REQUIRES_ATTENTION', composite_score: 76.8 },
  { route_id: 'LB-14', route_name: 'Hawksbay Coastal Feeder (Gulbai ⇄ Manora)', trips: 180, passengers: '14,200', avg_delay: '6.8m', on_time: '88.4%', utilization: '68.0%', headway: '15.0m', bunching: 'LOW (0.08)', demand: 'MODERATE', status: 'GOOD', composite_score: 83.2 }
];

const RouteIntelligence = () => {
  const [routes, setRoutes] = useState(DETAILED_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    analyticsAPI.getRoutePerformance()
      .then(res => {
        if (res.data?.route_scores?.length) {
          // Merge API scores with full operational metrics
          const merged = DETAILED_ROUTES.map(dr => {
            const apiMatch = res.data.route_scores.find(r => r.route_id === dr.route_id);
            return apiMatch ? { ...dr, ...apiMatch } : dr;
          });
          setRoutes(merged);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="page-container routeintel-page">
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>CORRIDOR BENCHMARKS // OPERATIONAL EFFICIENCY</span>
          </div>
          <h1 className="hero-main-title">Route Intelligence & Headway Monitoring</h1>
          <p className="hero-desc">
            Granular corridor-by-corridor telemetry evaluating trip execution, bunching probability index, passenger load factors, and schedule punctuality.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaRoute className="text-cyan" /> 110 CORRIDORS MONITORED</span>
        </div>
      </div>

      {/* Corridor Performance Table */}
      <div className="chart-card hud-panel hud-corners">
        <div className="chart-header">
          <div>
            <h3>Corridor Performance & Punctuality Index</h3>
            <span className="chart-subtitle">Click any row to open the Corridor Diagnostic Drawer</span>
          </div>
          <span className="badge-pill badge-aurora">INTERACTIVE TELEMETRY</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Corridor</th>
                <th>Route Designation</th>
                <th>Trips / Day</th>
                <th>Daily Volume</th>
                <th>Avg Delay</th>
                <th>On-Time %</th>
                <th>Load Factor</th>
                <th>Headway</th>
                <th>Bunching Index</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r, i) => (
                <tr 
                  key={i} 
                  className="interactive-route-row"
                  onClick={() => setSelectedRoute(r)}
                >
                  <td className="mono-val text-cyan"><strong>{r.route_id}</strong></td>
                  <td style={{ color: 'var(--color-text)', fontWeight: '600' }}>{r.route_name}</td>
                  <td className="mono-val">{r.trips || 380}</td>
                  <td className="mono-val">{r.passengers || '42,000'}</td>
                  <td className="mono-val" style={{ color: r.avg_delay?.includes('16') ? 'var(--color-danger)' : 'var(--color-accent)' }}>
                    {r.avg_delay || '8.2m'}
                  </td>
                  <td className="mono-val text-cyan">{r.on_time || `${r.components?.punctuality || 85}%`}</td>
                  <td className="mono-val text-gold">{r.utilization || `${r.components?.occupancy || 80}%`}</td>
                  <td className="mono-val">{r.headway || '7.5m'}</td>
                  <td className="mono-val" style={{ color: r.bunching?.includes('HIGH') ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {r.bunching || 'LOW (0.15)'}
                  </td>
                  <td className="mono-val text-cyan"><strong>{r.composite_score || 88}/100</strong></td>
                  <td>
                    <span className={`status-badge-chip ${r.status === 'EXCELLENT' ? 'valid' : (r.status === 'GOOD' ? 'flagged' : 'quarantined')}`}>
                      {r.status || 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route Detail Drawer */}
      {selectedRoute && (
        <div className="route-drawer-backdrop" onClick={() => setSelectedRoute(null)}>
          <div className="route-drawer-modal hud-corners" onClick={e => e.stopPropagation()}>
            <div className="route-drawer-header">
              <div className="rdh-title">
                <FaRoute className="text-cyan" />
                <h3>{selectedRoute.route_id} — {selectedRoute.route_name}</h3>
              </div>
              <button className="drawer-close-btn" onClick={() => setSelectedRoute(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="route-drawer-body">
              <div className="drawer-score-strip hud-panel">
                <div className="dss-item">
                  <span className="dss-label">COMPOSITE SCORE</span>
                  <span className="dss-val mono-val text-cyan">{selectedRoute.composite_score}/100</span>
                </div>
                <div className="dss-item">
                  <span className="dss-label">PUNCTUALITY</span>
                  <span className="dss-val mono-val">{selectedRoute.on_time || '84%'}</span>
                </div>
                <div className="dss-item">
                  <span className="dss-label">PEAK OCCUPANCY</span>
                  <span className="dss-val mono-val text-gold">{selectedRoute.utilization || '92%'}</span>
                </div>
                <div className="dss-item">
                  <span className="dss-label">BUNCHING RISK</span>
                  <span className="dss-val mono-val text-coral">{selectedRoute.bunching || 'LOW'}</span>
                </div>
              </div>

              <div className="drawer-sections-grid">
                <div className="drawer-section-card hud-panel">
                  <h4><FaMapMarkerAlt className="text-cyan" /> Terminal Sequence</h4>
                  <ul className="stops-sequence-list">
                    <li><span className="stop-num">01</span> Surjani Central Depot Terminal</li>
                    <li><span className="stop-num">02</span> 4K Chowrangi Interchange</li>
                    <li><span className="stop-num">03</span> Nagan Chowrangi High-Density Hub</li>
                    <li><span className="stop-num">04</span> Nazimabad 7 Commercial Stop</li>
                    <li><span className="stop-num">05</span> Guru Mandir Cultural Junction</li>
                    <li><span className="stop-num">06</span> Numaish BRT Underground Terminal</li>
                  </ul>
                </div>

                <div className="drawer-section-card hud-panel">
                  <h4><FaClock className="text-gold" /> Operational Diagnostics</h4>
                  <div className="drawer-spec-rows">
                    <div className="dsr-item">
                      <span>Scheduled Headway:</span>
                      <strong className="mono-val">{selectedRoute.headway || '6.0m'}</strong>
                    </div>
                    <div className="dsr-item">
                      <span>Average Terminal Dwell:</span>
                      <strong className="mono-val text-cyan">1.8 minutes</strong>
                    </div>
                    <div className="dsr-item">
                      <span>Fleet Assigned:</span>
                      <strong className="mono-val">28 Active Units</strong>
                    </div>
                    <div className="dsr-item">
                      <span>Daily Revenue Trips:</span>
                      <strong className="mono-val">{selectedRoute.trips || 420} Completed</strong>
                    </div>
                    <div className="dsr-item">
                      <span>Dispatch Recommendation:</span>
                      <strong className="mono-val text-gold">Inject +2 Reserve Vehicles at 07:45</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="route-drawer-footer">
              <span className="mono-val text-dim">METRIC ID: {selectedRoute.route_id}-TELEMETRY-LOG</span>
              <button className="btn-secondary-hud" onClick={() => setSelectedRoute(null)}>Close Drawer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteIntelligence;
