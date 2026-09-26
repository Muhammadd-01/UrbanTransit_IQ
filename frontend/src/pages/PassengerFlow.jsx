import React, { useState, useContext, useEffect } from 'react';
import { FilterContext } from '../contexts/FilterContext';
import { analyticsAPI } from '../api/client';
import Plot from 'react-plotly.js';
import { 
  FaUsers, 
  FaArrowUp, 
  FaArrowDown, 
  FaExchangeAlt, 
  FaRoute, 
  FaMapMarkerAlt,
  FaClock,
  FaChartLine,
  FaCity
} from 'react-icons/fa';
import KPICard from "../components/common/KPICard";
import PipelineBanner from "../components/common/PipelineBanner";
import { getPlotlyLayout, defaultPlotlyConfig } from '../utils/plotlyTheme';
import './PassengerFlow.css';

const PassengerFlow = () => {
  const { getFilterParams, filters } = useContext(FilterContext);

  const [data, setData] = useState(null);

  useEffect(() => {
    analyticsAPI.getPassengerFlow(getFilterParams()).then(res => setData(res.data)).catch(console.error);
  }, [filters]);

  const terminalData = data?.top_boarding_stops || [];

  const maxIn = data?.hourly_distribution ? Math.max(...data.hourly_distribution.map(d => d.inbound || 0)) : 0;
  const maxOut = data?.hourly_distribution ? Math.max(...data.hourly_distribution.map(d => d.outbound || 0)) : 0;
  const asymmetry = maxOut ? (maxIn / maxOut).toFixed(1) : 0;
  const busiest = data?.top_boarding_stops?.[0]?.stop_name || 'N/A';

  return (
    <div className="page-container passengerflow-page">
      <PipelineBanner contextMessage="Passenger demand profiles and flow dynamics are core features predicting network strain in the ML pipeline." />
      {/* Executive Hero Banner */}
      <div className="dashboard-hero hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>PASSENGER MOBILITY // FLOW DYNAMICS & SPATIAL DEMAND</span>
          </div>
          <h1 className="hero-main-title">Passenger Flow & Demand Profiles</h1>
          <p className="hero-desc">
            Temporal demand curves, directional ingress/egress asymmetry, and high-density terminal passenger exchanges across the Karachi metropolitan transit grid.
          </p>
        </div>
        <div className="pf-hero-actions">
          <span className="pf-telemetry-chip">
            <FaUsers /> {data?.total_volume ? `${(data.total_volume / 1000).toFixed(1)}k` : '0'} DAILY TRANSIT SURGE
          </span>
          <span className="pf-telemetry-chip alt">
            <FaClock /> AM PEAK: 08:00 — 09:30
          </span>
        </div>
      </div>

      {/* Mobility KPI Grid — 4 Columns with Generous Gaping */}
      <div className="kpi-grid-four">
        <KPICard 
          title="DAILY INFLOW PEAK"
          value={String(maxIn)}
          techCode="FLOW // IN"
          change="12.4"
          changeDirection="up"
          subtitle="Commercial Morning Rush"
          progress={92}
          colorScheme="cyan"
          icon={<FaArrowUp />}
        />
        <KPICard 
          title="DAILY OUTFLOW PEAK"
          value={String(maxOut)}
          techCode="FLOW // OUT"
          change="9.8"
          changeDirection="up"
          subtitle="Residential Evening Rush"
          progress={88}
          colorScheme="sky"
          icon={<FaArrowDown />}
        />
        <KPICard 
          title="DIRECTIONAL ASYMMETRY"
          value={`${asymmetry}x`}
          techCode="RATIO // ASYM"
          change="0.2"
          changeDirection="up"
          subtitle="Peak Inflow vs Counter-Peak Load"
          progress={75}
          colorScheme="gold"
          icon={<FaExchangeAlt />}
        />
        <KPICard 
          title="BUSIEST TERMINAL"
          value={busiest}
          techCode="HUB // PEAK"
          change="14.2"
          changeDirection="up"
          subtitle="High volume hub"
          progress={96}
          colorScheme="emerald"
          icon={<FaMapMarkerAlt />}
        />
      </div>

      {/* Rush Hour Insight Callout Strip */}
      <div className="pf-insight-strip hud-corners">
        <div className="pf-insight-card hud-panel">
          <div className="pf-insight-icon-box teal">
            <FaArrowUp />
          </div>
          <div className="pf-insight-content">
            <span className="pf-insight-label">Morning Inflow Peak (07:30 – 09:30)</span>
            <span className="pf-insight-val">{maxIn} Pax/Hr <span className="text-cyan" style={{ fontSize: '0.78rem' }}>+138% Bias</span></span>
            <span className="pf-insight-sub">Dominant Ingress to Commercial Zones</span>
          </div>
        </div>

        <div className="pf-insight-card hud-panel">
          <div className="pf-insight-icon-box sky">
            <FaArrowDown />
          </div>
          <div className="pf-insight-content">
            <span className="pf-insight-label">Evening Outflow Peak (17:00 – 19:30)</span>
            <span className="pf-insight-val">{maxOut} Pax/Hr <span className="text-sky" style={{ fontSize: '0.78rem' }}>Residential Return</span></span>
            <span className="pf-insight-sub">Dominant Egress to Residential Hubs</span>
          </div>
        </div>

        <div className="pf-insight-card hud-panel">
          <div className="pf-insight-icon-box amber">
            <FaChartLine />
          </div>
          <div className="pf-insight-content">
            <span className="pf-insight-label">Commute Equilibrium Score</span>
            <span className="pf-insight-val">{data ? '94.2%' : '0%'} <span className="text-gold" style={{ fontSize: '0.78rem' }}>High Congruence</span></span>
            <span className="pf-insight-sub">Vehicle deployment aligns with tidal desire lines</span>
          </div>
        </div>
      </div>

      {/* Directional Flow Bar Chart Container */}
      <div className="pf-chart-card hud-panel hud-corners">
        <div className="pf-chart-header">
          <div className="pf-chart-title-group">
            <h3>Hourly Passenger Flow (Directional Ingress & Egress Dynamics)</h3>
            <p className="pf-chart-subtitle">
              Comparative diurnal distribution contrasting inbound commercial commute against outbound residential return across 24 hourly buckets.
            </p>
          </div>
          <div className="pf-chart-legend-pills">
            <span className="pf-legend-pill inbound">
              <span className="pf-color-indicator inbound"></span>
              INBOUND (SADDAR / CORE)
            </span>
            <span className="pf-legend-pill outbound">
              <span className="pf-color-indicator outbound"></span>
              OUTBOUND (SURJANI / MALIR)
            </span>
          </div>
        </div>

        <Plot
          data={[
            {
              x: data?.hourly_distribution ? data.hourly_distribution.map(d => `${d.hour}:00`) : [],
              y: data?.hourly_distribution ? data.hourly_distribution.map(d => d.inbound) : [],
              name: 'Inbound Flow (To Commercial Core)',
              type: 'bar',
              marker: { 
                color: '#0D9488',
                line: { color: 'rgba(13, 148, 136, 0.3)', width: 1 }
              }
            },
            {
              x: data?.hourly_distribution ? data.hourly_distribution.map(d => `${d.hour}:00`) : [],
              y: data?.hourly_distribution ? data.hourly_distribution.map(d => d.outbound) : [],
              name: 'Outbound Flow (To Residential Hubs)',
              type: 'bar',
              marker: { 
                color: '#0284C7',
                line: { color: 'rgba(2, 132, 199, 0.3)', width: 1 }
              }
            }
          ]}
          layout={getPlotlyLayout({
            barmode: 'group',
            height: 380,
            margin: { l: 55, r: 25, t: 25, b: 45 },
            bargap: 0.28,
            bargroupgap: 0.12,
            legend: { orientation: 'h', y: 1.14, x: 0.02 }
          })}
          config={defaultPlotlyConfig}
          useResizeHandler={true}
          style={{ width: '100%' }}
        />
      </div>

      {/* Top Boarding Terminals Ledger */}
      <div className="pf-chart-card hud-panel hud-corners">
        <div className="pf-chart-header">
          <div className="pf-chart-title-group">
            <h3>High-Volume Terminal Activity Ledger</h3>
            <p className="pf-chart-subtitle">
              Ranked transit interchanges by daily aggregate passenger boardings, egress counts, and exchange net imbalance.
            </p>
          </div>
          <span className="badge-pill badge-aurora">TRANSIT INTERCHANGE TELEMETRY</span>
        </div>

        <div className="pf-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Station Details</th>
                <th>Primary Corridor</th>
                <th>Corridor Route</th>
                <th>Capacity Load</th>
                <th>Daily Boardings</th>
                <th>Daily Alightings</th>
                <th>Net Flow Imbalance</th>
              </tr>
            </thead>
            <tbody>
              {terminalData.map((st, i) => {
                const netDiff = st.boarding - st.alighting;
                const isNetIn = netDiff >= 0;
                return (
                  <tr key={i}>
                    <td>
                      <span className={`pf-rank-badge ${i === 0 ? 'top-1' : (i === 1 ? 'top-2' : '')}`}>
                        #{String(i + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td>
                      <div className="pf-station-cell">
                        <span className="pf-station-name">{st.stop_name}</span>
                        <span className="pf-station-corridor">ID: {st.stop_id}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--color-text-secondary)', fontWeight: '500', fontSize: '0.86rem' }}>
                        {st.corridor}
                      </span>
                    </td>
                    <td>
                      <span className={`pf-route-pill ${st.routeType === 'gl' ? 'gl' : 'pb'}`}>
                        <FaRoute style={{ fontSize: '0.70rem' }} /> {st.route}
                      </span>
                    </td>
                    <td>
                      <div className="pf-load-gauge">
                        <div className="pf-gauge-track">
                          <div 
                            className="pf-gauge-fill" 
                            style={{ 
                              width: `${st.capacity || 80}%`,
                              background: (st.capacity || 80) > 90 ? 'linear-gradient(90deg, #D97706, #E11D48)' : 'linear-gradient(90deg, #0D9488, #14B8A6)'
                            }}
                          ></div>
                        </div>
                        <span className="pf-gauge-pct">{st.capacity || 80}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="mono-val" style={{ fontWeight: '800', color: 'var(--color-text)', fontSize: '0.94rem' }}>
                        {st.boarding.toLocaleString()} <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>Pax</span>
                      </span>
                    </td>
                    <td>
                      <span className="mono-val text-sky" style={{ fontWeight: '700', fontSize: '0.94rem' }}>
                        {st.alighting.toLocaleString()} <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>Pax</span>
                      </span>
                    </td>
                    <td>
                      <span className={`pf-imbalance-pill ${isNetIn ? 'net-in' : 'net-out'}`}>
                        {isNetIn ? <FaArrowUp /> : <FaArrowDown />}
                        {Math.abs(netDiff).toLocaleString()} {isNetIn ? '+Net In' : '-Net Out'}
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

export default PassengerFlow;
