import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/client';
import Plot from 'react-plotly.js';
import { 
  FaMapMarkedAlt, 
  FaRoad, 
  FaExchangeAlt, 
  FaRoute, 
  FaArrowRight, 
  FaCompass, 
  FaChartPie, 
  FaCheckCircle 
} from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import { getPlotlyLayout, defaultPlotlyConfig } from '../utils/plotlyTheme';
import './ODAnalysis.css';

const ODAnalysis = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    analyticsAPI.getODMatrix().then(res => setData(res.data)).catch(console.error);
  }, []);

  const zones = data?.zones || ['Saddar', 'Clifton', 'Gulshan', 'Korangi', 'Nazimabad', 'Malir', 'SITE', 'Lyari'];

  const corridors = data?.top_corridors || [
    { origin: 'Gulshan-e-Iqbal', destination: 'Saddar Commercial Core', volume: 48200, dominant_route: 'PB-01', routeType: 'pb', share: 27 },
    { origin: 'Surjani Town BRT', destination: 'Numaish Interchange', volume: 44100, dominant_route: 'GL-01', routeType: 'gl', share: 24 },
    { origin: 'Korangi Industrial', destination: 'Saddar Commercial Core', volume: 38900, dominant_route: 'PB-08', routeType: 'pb', share: 21 },
    { origin: 'Malir Cantonment', destination: 'Tower Terminal', volume: 32400, dominant_route: 'PB-01', routeType: 'pb', share: 18 },
    { origin: 'Nazimabad Central', destination: 'SITE Industrial Area', volume: 29800, dominant_route: 'LB-04', routeType: 'lb', share: 16 }
  ];

  return (
    <div className="page-container odanalysis-page">
      {/* Executive Hero Banner */}
      <div className="dashboard-hero hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>SPATIAL COMMUTING // ORIGIN-DESTINATION (OD) MATRIX & DESIRE LINES</span>
          </div>
          <h1 className="hero-main-title">Origin-Destination (OD) Intelligence</h1>
          <p className="hero-desc">
            8×8 zonal passenger commuting exchange density across Karachi's administrative hubs, tracking directional passenger desire lines and dominant transit routes.
          </p>
        </div>
        <div className="od-hero-actions">
          <span className="od-telemetry-chip">
            <FaExchangeAlt /> 64 ZONE PAIRS AUDITED
          </span>
          <span className="od-telemetry-chip alt">
            <FaCheckCircle /> DESIRE MATCH: 91.4%
          </span>
        </div>
      </div>

      {/* OD KPI Strip — 4 Columns with Generous Gaping */}
      <div className="kpi-grid-four">
        <KPICard 
          title="BUSIEST CORRIDOR"
          value="Gulshan ➔ Saddar"
          techCode="OD // TOP"
          change="8.2"
          changeDirection="up"
          subtitle="48,200 daily passengers (PB-01)"
          progress={94}
          colorScheme="cyan"
          icon={<FaRoute />}
        />
        <KPICard 
          title="INTRA-ZONAL TRIPS"
          value="24.8%"
          techCode="OD // LOCAL"
          change="1.2"
          changeDirection="down"
          subtitle="Short circulator trips in same zone"
          progress={24.8}
          colorScheme="gold"
          icon={<FaExchangeAlt />}
        />
        <KPICard 
          title="AVG COMMUTE DISTANCE"
          value="14.2 km"
          techCode="DIST // KM"
          change="0.4"
          changeDirection="down"
          subtitle="Mean metropolitan transit distance"
          progress={65}
          colorScheme="sky"
          icon={<FaRoad />}
        />
        <KPICard 
          title="PEAK DESIRE CONGRUENCE"
          value="91.4%"
          techCode="NET // MATCH"
          change="3.1"
          changeDirection="up"
          subtitle="Transit lines matching desire lines"
          progress={91.4}
          colorScheme="emerald"
          icon={<FaMapMarkedAlt />}
        />
      </div>

      {/* Spatial Commuting Insight Callout Strip */}
      <div className="od-insight-strip hud-corners">
        <div className="od-insight-card hud-panel">
          <div className="od-insight-icon-box teal">
            <FaCompass />
          </div>
          <div className="od-insight-content">
            <span className="od-insight-label">Primary Radial Corridor Vector</span>
            <span className="od-insight-val">Gulshan ➔ Saddar <span className="text-cyan" style={{ fontSize: '0.78rem' }}>7,100 Pax/Hr</span></span>
            <span className="od-insight-sub">Highest single origin-destination gravitational pull</span>
          </div>
        </div>

        <div className="od-insight-card hud-panel">
          <div className="od-insight-icon-box gold">
            <FaChartPie />
          </div>
          <div className="od-insight-content">
            <span className="od-insight-label">Intra-Zonal Trip Containment</span>
            <span className="od-insight-val">24.8% Local Share <span className="text-gold" style={{ fontSize: '0.78rem' }}>Short Trips</span></span>
            <span className="od-insight-sub">Residual demand suited for feeder minibus routes</span>
          </div>
        </div>

        <div className="od-insight-card hud-panel">
          <div className="od-insight-icon-box emerald">
            <FaCheckCircle />
          </div>
          <div className="od-insight-content">
            <span className="od-insight-label">Network Alignment Fidelity</span>
            <span className="od-insight-val">91.4% Congruence <span className="text-emerald" style={{ fontSize: '0.78rem' }}>High Efficiency</span></span>
            <span className="od-insight-sub">Minimal transfer penalties between major hubs</span>
          </div>
        </div>
      </div>

      {/* 8x8 Zonal Heatmap Container */}
      <div className="od-chart-card hud-panel hud-corners">
        <div className="od-chart-header">
          <div className="od-chart-title-group">
            <h3>Zonal Passenger Exchange Density Heatmap</h3>
            <p className="od-chart-subtitle">
              Matrix cell values quantify aggregate daily passenger transfers from origin zones (Y-axis) to destination zones (X-axis).
            </p>
          </div>
          <span className="od-matrix-badge">
            <FaMapMarkedAlt /> 8×8 SPATIAL ZONAL GRID
          </span>
        </div>

        <div className="od-heatmap-wrapper">
          <Plot
            data={[{
              z: data?.matrix || [
                [1200, 4500, 6800, 3100, 5200, 2400, 4100, 2900],
                [4800, 1100, 3200, 4200, 2800, 1900, 2200, 1500],
                [7100, 3400, 1800, 4900, 6100, 5800, 3900, 2100],
                [3400, 4100, 4700, 1400, 3200, 6200, 5100, 1800],
                [5400, 2900, 6200, 3100, 1300, 2800, 4800, 3400],
                [2600, 2100, 5900, 6400, 2900, 1600, 2700, 1200],
                [4200, 2300, 3800, 5200, 4700, 2800, 1100, 3100],
                [3100, 1600, 2200, 1900, 3500, 1300, 3200, 900]
              ],
              x: zones,
              y: zones,
              type: 'heatmap',
              colorscale: [
                [0, '#F8FAFC'],
                [0.15, '#E0F2FE'],
                [0.35, '#7DD3FC'],
                [0.6, '#0D9488'],
                [0.85, '#0F766E'],
                [1.0, '#115E59']
              ],
              hovertemplate: '<b>Origin:</b> %{y}<br><b>Destination:</b> %{x}<br><b>Daily Commuters:</b> %{z:,}<extra></extra>',
              showscale: true,
              colorbar: {
                tickfont: { color: '#475569', family: 'IBM Plex Mono', size: 10 },
                title: { text: 'Commuters', font: { color: '#0F172A', size: 11, family: 'Plus Jakarta Sans', weight: '700' } },
                thickness: 16,
                len: 0.95
              }
            }]}
            layout={getPlotlyLayout({
              height: 480,
              margin: { l: 110, r: 40, t: 25, b: 85 },
              xaxis: { 
                tickfont: { family: 'IBM Plex Mono', color: '#334155', size: 11, weight: '600' },
                title: { text: 'Destination Zone', font: { family: 'Plus Jakarta Sans', size: 12, color: '#64748B', weight: '600' }, standoff: 18 }
              },
              yaxis: { 
                tickfont: { family: 'IBM Plex Mono', color: '#334155', size: 11, weight: '600' },
                title: { text: 'Origin Zone', font: { family: 'Plus Jakarta Sans', size: 12, color: '#64748B', weight: '600' }, standoff: 18 }
              }
            })}
            config={defaultPlotlyConfig}
            useResizeHandler={true}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Top High-Demand Commuter Corridors Ledger */}
      <div className="od-chart-card hud-panel hud-corners">
        <div className="od-chart-header">
          <div className="od-chart-title-group">
            <h3>Top High-Demand Origin-Destination Corridors</h3>
            <p className="od-chart-subtitle">
              Ranked transit trajectories prioritized by directional commute density, sector volume load, and dominant service routes.
            </p>
          </div>
          <span className="badge-pill badge-gold">CORRIDOR VOLUME LEDGER</span>
        </div>

        <div className="od-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Rank</th>
                <th>Corridor Trajectory</th>
                <th>Dominant Transit Line</th>
                <th>Daily Passengers</th>
                <th>Volume Capacity Gauge</th>
                <th>Sector Share</th>
                <th>Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {corridors.map((c, i) => {
                const isCongestionRisk = c.volume > 40000;
                return (
                  <tr key={i}>
                    <td>
                      <span className="mono-val" style={{ fontWeight: '800', color: '#64748B' }}>
                        #{String(i + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td>
                      <div className="od-trajectory-cell">
                        <span className="od-zone-chip">{c.origin}</span>
                        <span className="od-zone-arrow"><FaArrowRight /></span>
                        <span className="od-zone-dest">{c.destination}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`od-route-pill ${c.routeType || 'pb'}`}>
                        <FaRoute style={{ fontSize: '0.70rem' }} /> {c.dominant_route}
                      </span>
                    </td>
                    <td>
                      <span className="mono-val text-cyan" style={{ fontWeight: '800', fontSize: '0.94rem' }}>
                        {c.volume.toLocaleString()} <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>Pax</span>
                      </span>
                    </td>
                    <td>
                      <div className="od-volume-gauge">
                        <div className="od-gauge-track">
                          <div 
                            className="od-gauge-fill" 
                            style={{ 
                              width: `${Math.min(100, Math.round((c.volume / 50000) * 100))}%`,
                              background: isCongestionRisk ? 'linear-gradient(90deg, #D97706, #E11D48)' : 'linear-gradient(90deg, #0D9488, #0284C7)'
                            }}
                          ></div>
                        </div>
                        <span className="od-gauge-val">{Math.round((c.volume / 50000) * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="mono-val" style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                        {c.share || Math.round((c.volume / 180000) * 100)}% Sector
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge-chip ${isCongestionRisk ? 'quarantined' : 'valid'}`}>
                        {isCongestionRisk ? 'CONGESTION RISK' : 'CAPACITY OPTIMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ODAnalysis;
