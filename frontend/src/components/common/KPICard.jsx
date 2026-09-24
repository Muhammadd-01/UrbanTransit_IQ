import React from 'react';
import './KPICard.css';

const KPICard = ({ title, value, icon, change, changeDirection, subtitle }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        {change && (
          <div className={`kpi-change ${changeDirection}`}>
            {change}% {changeDirection === 'up' ? '↑' : '↓'}
          </div>
        )}
      </div>
      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
    </div>
  );
};
export default KPICard;