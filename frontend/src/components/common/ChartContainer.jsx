import React, { useState } from 'react';
import { FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import './ChartContainer.css';

const ChartContainer = ({ 
  title, 
  subtitle, 
  techBadge,
  children, 
  showTimeframes = false, 
  onTimeframeChange,
  onExport 
}) => {
  const [activeTf, setActiveTf] = useState('7D');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleTfClick = (tf) => {
    setActiveTf(tf);
    if (onTimeframeChange) onTimeframeChange(tf);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      window.print();
    }
  };

  return (
    <div className={`chart-container hud-panel hud-corners ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="chart-header">
        <div className="chart-header-title">
          <h3>{title}</h3>
          {techBadge && <span className="chart-tech-badge">{techBadge}</span>}
          {subtitle && <span className="chart-subtitle">{subtitle}</span>}
        </div>

        <div className="chart-toolbar">
          {showTimeframes && (
            <div className="chart-timeframes">
              {['1D', '7D', '30D', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  className={`tf-btn ${activeTf === tf ? 'active' : ''}`}
                  onClick={() => handleTfClick(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}

          <button 
            className="chart-tool-btn" 
            onClick={handleExport}
            title="Export / Download Telemetry"
          >
            <FaDownload />
          </button>

          <button 
            className="chart-tool-btn" 
            onClick={() => setIsFullscreen(prev => !prev)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      <div className="chart-body">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;