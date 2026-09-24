import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/client';
import { FaBus, FaCar, FaWrench, FaTools, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './VehicleAnalytics.css';

const DEFAULT_MAINTENANCE = [
  { vehicle_id: 'VH-104', type: 'Yutong Hybrid City Bus (12m)', age_years: 3.2, delay_count: 14, condition: 'CRITICAL', depot: 'Surjani Depot', odometer: '142,500 km' },
  { vehicle_id: 'VH-089', type: 'King Long BRT Articulated (18m)', age_years: 2.8, delay_count: 9, condition: 'WARNING', depot: 'Numaish Hub', odometer: '189,200 km' },
  { vehicle_id: 'VH-212', type: 'Foton Electric Feeder (8m)', age_years: 1.4, delay_count: 7, condition: 'WARNING', depot: 'Korangi Workshop', odometer: '64,100 km' },
  { vehicle_id: 'VH-045', type: 'Yutong Hybrid City Bus (12m)', age_years: 4.1, delay_count: 12, condition: 'CRITICAL', depot: 'Surjani Depot', odometer: '210,400 km' }
];

const VehicleAnalytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    analyticsAPI.getVehicleUtilization()
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);

  const maintenanceList = data?.maintenance_flagged_vehicles?.length 
    ? data.maintenance_flagged_vehicles 
    : DEFAULT_MAINTENANCE;

  return (
    <div className="page-container vehicleanalytics-page">
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>FLEET OPERATIONS // ASSET TELEMETRY</span>
          </div>
          <h1 className="hero-main-title">Vehicle Fleet & Maintenance Analytics</h1>
          <p className="hero-desc">
            Karachi transit fleet duty cycles, depot reserve buffer status, odometer wear indices, and predictive maintenance triage queue.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaBus className="text-cyan" /> 242 BUSES MONITORED</span>
        </div>
      </div>

      {/* Fleet KPI Strip */}
      <div className="kpi-grid-four">
        <KPICard 
          title="ACTIVE FLEET"
          value={String(data?.active_fleet_count || 242)}
          techCode="FLT // ACTIVE"
          change="4.2"
          changeDirection="up"
          subtitle="Operational units in service"
          progress={93}
          colorScheme="cyan"
          icon={<FaBus />}
        />
        <KPICard 
          title="IDLE / RESERVE"
          value={String(data?.idle_fleet_count || 18)}
          techCode="FLT // STBY"
          change="0.0"
          changeDirection="up"
          subtitle="Depot standby buffer"
          progress={7}
          colorScheme="gold"
          icon={<FaCar />}
        />
        <KPICard 
          title="DAILY TRIPS / BUS"
          value={String(data?.avg_daily_trips_per_vehicle || '8.6')}
          techCode="OPS // TURN"
          change="1.2"
          changeDirection="up"
          subtitle="Corridor turnaround rate"
          progress={86}
          colorScheme="sky"
          icon={<FaTools />}
        />
        <KPICard 
          title="FLEET UTILIZATION"
          value={`${(data?.fleet_utilization_rate * 100 || 89).toFixed(0)}%`}
          techCode="EFF // DUTY"
          change="2.4"
          changeDirection="up"
          subtitle="Optimal duty cycle target"
          progress={89}
          colorScheme="emerald"
          icon={<FaCheckCircle />}
        />
      </div>

      {/* Maintenance Table */}
      <div className="chart-card hud-panel hud-corners">
        <div className="chart-header">
          <div>
            <h3>Predictive Maintenance Attention Queue</h3>
            <span className="chart-subtitle">Early warning triage based on mechanical delay frequencies and mileage</span>
          </div>
          <span className="badge-pill badge-gold">TRIAGE QUEUE</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Bus Chassis Type</th>
                <th>Assigned Depot</th>
                <th>Service Age</th>
                <th>Cumulative Mileage</th>
                <th>Delay Incidents</th>
                <th>Triage Priority</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceList.map((v, i) => (
                <tr key={i}>
                  <td className="mono-val text-cyan"><strong>{v.vehicle_id}</strong></td>
                  <td style={{ color: 'var(--color-text)', fontWeight: '600' }}>{v.type}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{v.depot || 'Surjani Depot'}</td>
                  <td className="mono-val text-dim">{v.age_years} Years</td>
                  <td className="mono-val">{v.odometer || '142,000 km'}</td>
                  <td className="mono-val text-coral"><strong>{v.delay_count} Events</strong></td>
                  <td>
                    <span className={`status-badge-chip ${v.condition === 'CRITICAL' ? 'quarantined' : 'corrected'}`}>
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
