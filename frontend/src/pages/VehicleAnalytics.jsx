import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/client';
import { FaBus, FaCar, FaWrench, FaTools } from 'react-icons/fa';
import './VehicleAnalytics.css';

const VehicleAnalytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    analyticsAPI.getVehicleUtilization().then(res => setData(res.data));
  }, []);

  return (
    <div className="page-container vehicleanalytics-page">
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title">Fleet Utilization & Vehicle Telemetry</h1>
          <p className="page-desc">
            Karachi fleet operating duty cycles, depot reserve buffer status, and predictive maintenance triage queue.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-aurora)' }}>
          <div className="kpi-header">ACTIVE FLEET</div>
          <div className="kpi-value" style={{ color: 'var(--accent-aurora)' }}>{data?.active_fleet_count || 242}</div>
          <div className="kpi-trend">Operational Units on Road</div>
        </div>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-gold)' }}>
          <div className="kpi-header">IDLE / RESERVE</div>
          <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>{data?.idle_fleet_count || 18}</div>
          <div className="kpi-trend">Depot Standby Buffer</div>
        </div>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-violet)' }}>
          <div className="kpi-header">DAILY TRIPS / BUS</div>
          <div className="kpi-value" style={{ color: 'var(--accent-violet)' }}>{data?.avg_daily_trips_per_vehicle || 8.6}</div>
          <div className="kpi-trend">Corridor Turnaround Rate</div>
        </div>
        <div className="kpi-card" style={{ borderTop: '3px solid var(--accent-aurora)' }}>
          <div className="kpi-header">FLEET UTILIZATION</div>
          <div className="kpi-value" style={{ color: 'var(--accent-aurora)' }}>{(data?.fleet_utilization_rate * 100 || 89).toFixed(0)}%</div>
          <div className="kpi-trend">Optimal Duty Cycle Target</div>
        </div>
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FaWrench style={{ color: 'var(--accent-gold)' }} />
          <h3>Predictive Maintenance Attention Queue</h3>
        </div>

        <div className="table-container" style={{ border: 'none', background: 'transparent', padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Bus Chassis Type</th>
                <th>Service Age</th>
                <th>Delay Incidents</th>
                <th>Condition Triage</th>
              </tr>
            </thead>
            <tbody>
              {data?.maintenance_flagged_vehicles?.map((v, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{v.vehicle_id}</td>
                  <td>{v.type}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.age_years} Years</td>
                  <td style={{ color: 'var(--accent-coral)', fontWeight: '800' }}>{v.delay_count}</td>
                  <td>
                    <span className={`badge-pill ${v.condition === 'CRITICAL' ? 'badge-coral' : 'badge-gold'}`}>
                      {v.condition}
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

export default VehicleAnalytics;
