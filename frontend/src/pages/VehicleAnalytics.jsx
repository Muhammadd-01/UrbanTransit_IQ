import React, { useState, useContext, useEffect } from 'react';
import { FilterContext } from '../contexts/FilterContext';
import { analyticsAPI } from '../api/client';
import { FaBus, FaCar, FaWrench, FaTools, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import KPICard from '../components/common/KPICard';
import './VehicleAnalytics.css';
import PipelineBanner from '../components/common/PipelineBanner';


const VehicleAnalytics = () => {
  const { getFilterParams, filters } = useContext(FilterContext);

  const [data, setData] = useState(null);

  useEffect(() => {
    analyticsAPI.getVehicleUtilization(getFilterParams())
      .then(res => setData(res.data))
      .catch(console.error);
  }, [filters]);

  const maintenanceList = data?.maintenance_flagged_vehicles || [];

  return (
    <div className="page-container vehicleanalytics-page">
      <PipelineBanner contextMessage="Vehicle load capacities and active utilization form the backbone of the overcrowding classifier." />
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
          value={String(data?.active_vehicles || 0)}
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
          value={data?.total_vehicles ? String(data.total_vehicles - (data.active_vehicles || 0)) : '0'}
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
          value={String(data?.avg_daily_trips_per_vehicle || '0')}
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
          value={data?.utilization_rate ? `${(data.utilization_rate * 100).toFixed(0)}%` : '0%'}
          techCode="EFF // DUTY"
          change="2.4"
          changeDirection="up"
          subtitle="Optimal duty cycle target"
          progress={data?.utilization_rate ? (data.utilization_rate * 100) : 0}
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
              {maintenanceList.length === 0 && (
                <tr><td colSpan="7" style={{textAlign:'center'}}>No flagged vehicles</td></tr>
              )}
              {maintenanceList.map((v, i) => (
                <tr key={i}>
                  <td className="mono-val text-cyan"><strong>{v.vehicle_id}</strong></td>
                  <td style={{ color: 'var(--color-text)', fontWeight: '600' }}>{v.type || 'N/A'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{v.depot || 'N/A'}</td>
                  <td className="mono-val text-dim">{v.age_years || 'N/A'} Years</td>
                  <td className="mono-val">{v.odometer || 'N/A'}</td>
                  <td className="mono-val text-coral"><strong>{v.delay_count || 0} Events</strong></td>
                  <td>
                    <span className={`status-badge-chip ${v.condition === 'CRITICAL' ? 'quarantined' : 'corrected'}`}>
                      {v.condition || 'N/A'}
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
