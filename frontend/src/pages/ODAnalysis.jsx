import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/client';
import Plot from 'react-plotly.js';
import { FaMapMarkedAlt, FaRoad } from 'react-icons/fa';
import './ODAnalysis.css';

const ODAnalysis = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    analyticsAPI.getODMatrix().then(res => setData(res.data));
  }, []);

  return (
    <div className="page-container odanalysis-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Origin-Destination (OD) Matrix</h1>
          <p className="page-desc">
            Zone-to-zone passenger commuting matrix across Karachi's 8 primary administrative zones with spatial transit density gradients.
          </p>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <FaMapMarkedAlt style={{ color: 'var(--accent-aurora)' }} />
          <h3>Zonal Passenger Exchange Density Heatmap</h3>
        </div>
        <Plot
          data={[{
            z: data?.matrix || [],
            x: data?.zones || [],
            y: data?.zones || [],
            type: 'heatmap',
            colorscale: [
              [0, '#f1f5f9'],
              [0.2, '#a7f3d0'],
              [0.5, '#34d399'],
              [0.75, '#059669'],
              [1.0, '#d97706']
            ],
            showscale: true,
            colorbar: {
              tickfont: { color: '#334155', family: 'Plus Jakarta Sans' },
              title: { text: 'Commuters', font: { color: '#334155' } }
            }
          }]}
          layout={{
            height: 420,
            margin: { l: 90, r: 40, t: 20, b: 70 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#334155', family: 'Plus Jakarta Sans, sans-serif' },
            xaxis: { gridcolor: 'transparent', tickfont: { color: '#334155' } },
            yaxis: { gridcolor: 'transparent', tickfont: { color: '#334155' } }
          }}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler={true}
          style={{ width: '100%' }}
        />
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FaRoad style={{ color: 'var(--accent-gold)' }} />
          <h3>Top High-Demand Commuter Corridors</h3>
        </div>

        <div className="table-container" style={{ border: 'none', background: 'transparent', padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Origin Zone</th>
                <th>Destination Zone</th>
                <th>Sampled Volume</th>
                <th>Dominant Transit Line</th>
              </tr>
            </thead>
            <tbody>
              {data?.top_corridors?.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{c.origin}</td>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{c.destination}</td>
                  <td style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>{c.volume.toLocaleString()} Pax</td>
                  <td>
                    <span className="badge-pill badge-aurora">
                      {c.dominant_route}
                    </span>
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

export default ODAnalysis;
