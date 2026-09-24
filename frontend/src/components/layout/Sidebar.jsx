import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaDatabase, FaChartLine, FaRoute, FaClock, FaCar, FaMagic, FaExclamationTriangle, FaLightbulb, FaExchangeAlt, FaCog, FaFileAlt, FaUser } from 'react-icons/fa';
import logoImg from '../../assets/logo.png';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-header-flex">
          <img src={logoImg} alt="UrbanTransit IQ" className="sidebar-logo-icon" />
          <div className="brand-text-col">
            <h2>UrbanTransit IQ</h2>
            <span className="badge-dev">KARACHI METRO</span>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-group">OVERVIEW</div>
        <NavLink to="/"><FaTachometerAlt /> Dashboard</NavLink>
        
        <div className="nav-group">DATA</div>
        <NavLink to="/data-management"><FaDatabase /> Data Management</NavLink>
        <NavLink to="/data-quality"><FaDatabase /> Data Quality</NavLink>
        
        <div className="nav-group">ANALYTICS</div>
        <NavLink to="/passenger-flow"><FaChartLine /> Passenger Flow</NavLink>
        <NavLink to="/od-analysis"><FaExchangeAlt /> OD Analysis</NavLink>
        <NavLink to="/route-intelligence"><FaRoute /> Route Intelligence</NavLink>
        <NavLink to="/delay-analytics"><FaClock /> Delay Analytics</NavLink>
        <NavLink to="/vehicle-analytics"><FaCar /> Vehicle Analytics</NavLink>
        
        <div className="nav-group">INTELLIGENCE</div>
        <NavLink to="/forecasting"><FaChartLine /> Forecasting</NavLink>
        <NavLink to="/clustering"><FaMagic /> Clustering</NavLink>
        <NavLink to="/anomaly-detection"><FaExclamationTriangle /> Anomaly Detection</NavLink>
        
        <div className="nav-group">DECISIONS</div>
        <NavLink to="/recommendations"><FaLightbulb /> Recommendations</NavLink>
        <NavLink to="/what-if-simulator"><FaExchangeAlt /> What-If Simulator</NavLink>
        
        <div className="nav-group">SYSTEM</div>
        <NavLink to="/profile"><FaUser /> Profile</NavLink>
        <NavLink to="/model-comparison"><FaCog /> Model Comparison</NavLink>
        <NavLink to="/reports"><FaFileAlt /> Reports</NavLink>
        <NavLink to="/settings"><FaCog /> Settings</NavLink>
      </nav>
    </div>
  );
};
export default Sidebar;