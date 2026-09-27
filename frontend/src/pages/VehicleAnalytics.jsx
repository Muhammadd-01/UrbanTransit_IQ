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
      <PipelineBanner contextMessage="Train the AI to predict which buses are likely to break down or become overcrowded, helping plan better maintenance schedules." />
      {/* Header */}
      <div className="dashboard-hero hud-panel hud-corners">
        <div className="hero-text-block">
          <div className="hero-super-tag">
            <span className="pulse-beacon-cyan"></span>
            <span>BUS FLEET — VEHICLE STATUS & PERFORMANCE</span>
          </div>
          <h1 className="hero-main-title">Vehicle Fleet & Maintenance Analytics</h1>
          <p className="hero-desc">
            Monitor the health of every bus in the fleet. Track which vehicles need maintenance, which ones are in service, and plan repairs before breakdowns happen.
          </p>
        </div>
        <div className="hero-right-actions">
          <span className="sys-badge"><FaBus className="text-cyan" /> 242 BUSES MONITORED</span>
        </div>
      </div>

      {/* Fleet KPI Strip */}
      <div className="kpi-grid-four">
        <KPICard 
          title="BUSES IN SERVICE"
          value={String(data?.active_vehicles || 0)}
          techCode="Active"
          change="4.2"
          changeDirection="up"
          subtitle="Currently running on routes"
          progress={93}
          colorScheme="cyan"
          icon={<FaBus />}
        />
        <KPICard 
          title="STANDBY BUSES"
          value={String((data?.total_vehicles || 242) - (data?.active_vehicles || 0))}
          techCode="Reserve"
          change="0.0"
          changeDirection="up"
          subtitle="Ready to deploy if needed"
          progress={7}
          colorScheme="gold"
          icon={<FaCar />}
        />
        <KPICard 
          title="TRIPS PER BUS TODAY"
          value={String(data?.avg_daily_trips_per_vehicle || (data?.total_trips_today ? Math.round(data.total_trips_today / (data.active_vehicles || 1)) : 0))}
          techCode="Trips"
          change="1.2"
          changeDirection="up"
          subtitle="Average number of round trips each bus makes"
          progress={86}
          colorScheme="sky"
          icon={<FaTools />}
        />
        <KPICard 
          title="FLEET USAGE RATE"
          value={`${((data?.utilization_rate || 0) * 100).toFixed(0)}%`}
          techCode="Usage"
          change="2.4"
          changeDirection="up"
          subtitle="Percentage of fleet actively in use"
          progress={(data?.utilization_rate || 0) * 100}
          colorScheme="emerald"
          icon={<FaCheckCircle />}
        />
      </div>

      {/* Maintenance Table */}
      <div className="chart-card hud-panel hud-corners">
        <div className="chart-header">
          <div>
            <h3>Buses Needing Maintenance</h3>
            <span className="chart-subtitle">Buses flagged for maintenance based on age, mileage, and recent delay issues</span>
          </div>
          <span className="badge-pill badge-gold">PRIORITY LIST</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Bus Type</th>
                <th>Home Depot</th>
                <th>Years in Service</th>
                <th>Total Kilometers</th>
                <th>Recent Delays</th>
                <th>Maintenance Priority</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceList.length === 0 && (
                <tr><td colSpan="7" style={{textAlign:'center'}}>No buses need immediate maintenance</td></tr>
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
