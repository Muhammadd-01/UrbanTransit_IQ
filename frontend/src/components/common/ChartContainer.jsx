import React from 'react';
import './ChartContainer.css';

const ChartContainer = ({ title, subtitle, children }) => (
  <div className="chart-container card">
    <div className="chart-header">
      <h3>{title}</h3>
      {subtitle && <span>{subtitle}</span>}
      <button className="btn-download">Download</button>
    </div>
    <div className="chart-body">{children}</div>
  </div>
);
export default ChartContainer;