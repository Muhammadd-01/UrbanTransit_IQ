import React from 'react';
import './KPICard.css';

const KPICard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeDirection = 'up', 
  subtitle, 
  techCode,
  progress = null,
  colorScheme = 'cyan' // 'cyan', 'gold', 'sky', 'coral', 'emerald'
}) => {
  return (
    <div className={`kpi-card hud-panel hud-corners scheme-${colorScheme}`}>
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <div className="kpi-header-right">
          {techCode && <span className="kpi-tech-code">{techCode}</span>}
          {icon && <span className="kpi-icon">{icon}</span>}
        </div>
      </div>

      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        {change && (
          <div className={`kpi-change ${changeDirection}`}>
            <span className="change-arrow">{changeDirection === 'up' ? '▲' : '▼'}</span>
            <span>{change}%</span>
          </div>
        )}
      </div>

      {progress !== null && (
        <div className="kpi-progress-track">
          <div 
            className="kpi-progress-fill" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
      )}

      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      <div className={`kpi-accent-bar bar-${colorScheme}`}></div>
    </div>
  );
};

export default KPICard;