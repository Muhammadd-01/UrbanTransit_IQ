import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaTachometerAlt, FaRoute, FaClock, FaExchangeAlt, 
  FaChartLine, FaMagic, FaExclamationTriangle, FaLightbulb, 
  FaCar, FaDatabase, FaCog, FaFileAlt, FaUser, FaTimes, FaShieldAlt
} from 'react-icons/fa';
import './CommandPalette.css';

const COMMANDS = [
  { id: 'overview', title: 'Dashboard Overview', category: 'Intelligence', path: '/', icon: <FaTachometerAlt /> },
  { id: 'flow', title: 'Passenger Flow Analytics', category: 'Intelligence', path: '/passenger-flow', icon: <FaChartLine /> },
  { id: 'od', title: 'Origin-Destination (OD) Matrix', category: 'Intelligence', path: '/od-analysis', icon: <FaExchangeAlt /> },
  { id: 'routes', title: 'Route Intelligence & Scores', category: 'Network', path: '/route-intelligence', icon: <FaRoute /> },
  { id: 'vehicles', title: 'Vehicle Fleet & Maintenance', category: 'Network', path: '/vehicle-analytics', icon: <FaCar /> },
  { id: 'delays', title: 'Delay Analytics & ML Inference', category: 'Operations', path: '/delay-analytics', icon: <FaClock /> },
  { id: 'forecasting', title: '14-Day Demand & Occupancy Forecast', category: 'Data Science', path: '/forecasting', icon: <FaChartLine /> },
  { id: 'clustering', title: 'K-Means Route Clustering', category: 'Data Science', path: '/clustering', icon: <FaMagic /> },
  { id: 'anomalies', title: 'Anomaly Detection & Telemetry', category: 'Data Science', path: '/anomaly-detection', icon: <FaExclamationTriangle /> },
  { id: 'recommendations', title: 'Operational Recommendations', category: 'Decision Intelligence', path: '/recommendations', icon: <FaLightbulb /> },
  { id: 'simulator', title: 'What-If Counterfactual Sandbox', category: 'Decision Intelligence', path: '/what-if-simulator', icon: <FaExchangeAlt /> },
  { id: 'comparison', title: 'Spark vs Python Dual-Pipeline', category: 'Decision Intelligence', path: '/model-comparison', icon: <FaShieldAlt /> },
  { id: 'quality', title: '4-Tier Data Quality Governance', category: 'Platform', path: '/data-quality', icon: <FaDatabase /> },
  { id: 'datasets', title: 'Data Management & HDFS Fabric', category: 'Platform', path: '/data-management', icon: <FaDatabase /> },
  { id: 'reports', title: 'Export Center & Benchmark Ledgers', category: 'Platform', path: '/reports', icon: <FaFileAlt /> },
  { id: 'settings', title: 'Externalized Analytical Thresholds', category: 'Platform', path: '/settings', icon: <FaCog /> },
  { id: 'profile', title: 'Operator Profile & Team Roster', category: 'Platform', path: '/profile', icon: <FaUser /> }
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          navigate(filteredCommands[selectedIndex].path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette-modal hud-panel" onClick={e => e.stopPropagation()}>
        <div className="palette-header">
          <FaSearch className="palette-search-icon" />
          <input 
            type="text" 
            placeholder="Type a module or command (e.g. Delays, Forecast, Spark)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <span className="palette-shortcut-badge">ESC</span>
          <button className="palette-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="palette-list">
          {filteredCommands.length === 0 ? (
            <div className="palette-empty">No matching modules found in system registry.</div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div 
                key={cmd.id}
                className={`palette-item ${idx === selectedIndex ? 'active' : ''}`}
                onClick={() => {
                  navigate(cmd.path);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="palette-item-left">
                  <span className="palette-item-icon">{cmd.icon}</span>
                  <div className="palette-item-info">
                    <span className="palette-item-title">{cmd.title}</span>
                    <span className="palette-item-cat">{cmd.category}</span>
                  </div>
                </div>
                <span className="palette-item-arrow">↵ Jump</span>
              </div>
            ))
          )}
        </div>

        <div className="palette-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
          <span><kbd>↵</kbd> to select</span>
          <span><kbd>ESC</kbd> to dismiss</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
