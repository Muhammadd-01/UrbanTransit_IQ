import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/client';
import Plot from 'react-plotly.js';
import { FaUsers, FaArrowUp, FaArrowDown, FaExchangeAlt } from 'react-icons/fa';
import './PassengerFlow.css';

const PassengerFlow = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    analyticsAPI.getPassengerFlow().then(res => setData(res.data));
  }, []);

  return (
    <div className="page-container passengerflow-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Passenger Flow & Boarding Profiles</h1>
          <p className="page-desc">
            Temporal demand curves, commuter ingress/egress splits, and terminal passenger exchange distributions across Karachi.
          </p>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <FaExchangeAlt style={{ color: 'var(--accent-aurora)' }} />
          <h3>Inbound vs Outbound Hourly Surges</h3>
        </div>
        <Plot
          data={[
            {
              x: data?.hourly_distribution ? data.hourly_distribution.map(d => `${d.hour}:00`) : [],
              y: data?.hourly_distribution ? data.hourly_distribution.map(d => d.inbound) : [],
              name: 'Inbound Flow (To Saddar / I.I. Chundrigar)',
              type: 'bar',
              marker: { 
                color: '#d97706',
                line: { color: 'rgba(255, 255, 255, 0.4)', width: 1 }
              }
            },
            {
              x: data?.hourly_distribution ? data.hourly_distribution.map(d => `${d.hour}:00`) : [],
              y: data?.hourly_distribution ? data.hourly_distribution.map(d => d.outbound) : [],
              name: 'Outbound Flow (To Residential Surjani / Malir)',
              type: 'bar',
              marker: { 
                color: '#059669',
                line: { color: 'rgba(255, 255, 255, 0.4)', width: 1 }
              }
            }
          ]}
          layout={{
            barmode: 'group',
            height: 340,
            margin: { l: 40, r: 20, t: 20, b: 40 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#334155', family: 'Plus Jakarta Sans, sans-serif' },
            yaxis: { gridcolor: 'rgba(0, 0, 0, 0.06)', color: '#64748b' },
            xaxis: { gridcolor: 'rgba(0, 0, 0, 0.06)', color: '#64748b' },
            legend: { orientation: 'h', y: 1.1, font: { color: '#0f172a' } }
          }}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler={true}
          style={{ width: '100%' }}
        />
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FaUsers style={{ color: 'var(--accent-gold)' }} />
          <h3>Top Boarding Stations</h3>
        </div>

        <div className="table-container" style={{ border: 'none', background: 'transparent', padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Stop ID</th>
                <th>Station Name</th>
                <th>Daily Boardings</th>
                <th>Daily Alightings</th>
              </tr>
            </thead>
            <tbody>
              {data?.top_boarding_stops?.map((st, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{st.stop_id}</td>
                  <td>{st.stop_name}</td>
                  <td style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>{st.boarding.toLocaleString()}</td>
                  <td style={{ color: 'var(--accent-aurora)', fontWeight: '600' }}>{st.alighting.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PassengerFlow;
