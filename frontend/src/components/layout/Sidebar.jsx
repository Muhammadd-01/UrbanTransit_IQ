import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, FaRoute, FaCar, FaClock, 
  FaChartLine, FaMagic, FaExclamationTriangle,
  FaLightbulb, FaExchangeAlt, FaShieldAlt,
  FaDatabase, FaFileAlt, FaCog, FaUser,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import './Sidebar.css';
import Logo from '../common/Logo';
import { AuthContext } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const role = user?.role || 'viewer';
  
  // Define Role-Based Access Control logic
  const hasAccess = (requiredRoles) => {
    if (role === 'admin') return true;
    return requiredRoles.includes(role);
  };
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-header-flex">
          <Logo size={34} className="sidebar-logo-icon" />
          <div className="brand-text-col nav-text">
            <h2>UrbanTransit <span className="brand-iq">IQ</span></h2>
            <span className="badge-dev">V1.0.0 PRO</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Intelligence Group (Accessible to all basic roles) */}
        {hasAccess(['executer', 'analyst', 'operator', 'viewer']) && (
          <>
            <div className="nav-group-header">
              <span className="nav-text">INTELLIGENCE</span>
            </div>
            <NavLink to="/dashboard" end title="Dashboard Overview">
              <FaTachometerAlt className="nav-icon" />
              <span className="nav-text">Overview</span>
            </NavLink>
            <NavLink to="/passenger-flow" title="Passenger Flow Analytics">
              <FaChartLine className="nav-icon" />
              <span className="nav-text">Passenger Flow</span>
            </NavLink>
            <NavLink to="/od-analysis" title="Origin-Destination Matrix">
              <FaExchangeAlt className="nav-icon" />
              <span className="nav-text">OD Analysis</span>
            </NavLink>
          </>
        )}

        {/* Network & Operations Group */}
        {hasAccess(['executer', 'analyst', 'operator']) && (
          <>
            <div className="nav-group-header">
              <span className="nav-text">NETWORK & OPERATIONS</span>
            </div>
            <NavLink to="/route-intelligence" title="Route Intelligence & Headways">
              <FaRoute className="nav-icon" />
              <span className="nav-text">Route Intelligence</span>
            </NavLink>
            <NavLink to="/vehicle-analytics" title="Vehicle Fleet & Maintenance">
              <FaCar className="nav-icon" />
              <span className="nav-text">Vehicle Analytics</span>
            </NavLink>
            <NavLink to="/delay-analytics" title="Delay Analytics & ML Inference">
              <FaClock className="nav-icon" />
              <span className="nav-text">Delay Analytics</span>
            </NavLink>
          </>
        )}

        {/* Data Science Group (Only Analysts & Executers & Admin) */}
        {hasAccess(['executer', 'analyst']) && (
          <>
            <div className="nav-group-header">
              <span className="nav-text">DATA SCIENCE</span>
            </div>
            <NavLink to="/forecasting" title="Demand & Occupancy Forecast">
              <FaChartLine className="nav-icon" />
              <span className="nav-text">Demand Forecast</span>
            </NavLink>
            <NavLink to="/clustering" title="K-Means Route Clustering">
              <FaMagic className="nav-icon" />
              <span className="nav-text">Route Clustering</span>
            </NavLink>
            <NavLink to="/anomaly-detection" title="Isolation Forest Anomaly Telemetry">
              <FaExclamationTriangle className="nav-icon" />
              <span className="nav-text">Anomaly Detection</span>
            </NavLink>
          </>
        )}

        {/* Decision Intelligence Group (Executer, Analyst, Admin) */}
        {hasAccess(['executer', 'analyst']) && (
          <>
            <div className="nav-group-header">
              <span className="nav-text">DECISION INTELLIGENCE</span>
            </div>
            <NavLink to="/recommendations" title="Algorithmic Operational Actions">
              <FaLightbulb className="nav-icon" />
              <span className="nav-text">Recommendations</span>
            </NavLink>
            <NavLink to="/what-if-simulator" title="Counterfactual Scenario Sandbox">
              <FaExchangeAlt className="nav-icon" />
              <span className="nav-text">What-If Simulation</span>
            </NavLink>
            <NavLink to="/model-comparison" title="Spark vs Python Pipeline Consensus">
              <FaShieldAlt className="nav-icon" />
              <span className="nav-text">Pipeline Consensus</span>
            </NavLink>
          </>
        )}

        {/* Platform Group (Admin only mostly, some for executer) */}
        {hasAccess([]) && (
          <>
            <div className="nav-group-header">
              <span className="nav-text">PLATFORM CONFIG</span>
            </div>
            <NavLink to="/data-quality" title="4-Tier Data Quality Governance">
              <FaDatabase className="nav-icon" />
              <span className="nav-text">Data Quality</span>
            </NavLink>
            <NavLink to="/data-management" title="HDFS Storage Fabric & Synthesis">
              <FaDatabase className="nav-icon" />
              <span className="nav-text">Dataset Manager</span>
            </NavLink>
            <NavLink to="/settings" title="Externalized Analytical Thresholds">
              <FaCog className="nav-icon" />
              <span className="nav-text">System Settings</span>
            </NavLink>
          </>
        )}
        
        {/* Universal Reports & Profile (Everyone) */}
        <div className="nav-group-header">
          <span className="nav-text">USER</span>
        </div>
        <NavLink to="/reports" title="Export Hub & Benchmark JSONs">
          <FaFileAlt className="nav-icon" />
          <span className="nav-text">Export Reports</span>
        </NavLink>
        <NavLink to="/profile" title="Operator Credentials & Team Roster">
          <FaUser className="nav-icon" />
          <span className="nav-text">Operator Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-engine-tag">
          <span className="engine-dot"></span>
          <span className="nav-text">SPARK 3.5 // FASTAPI</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
