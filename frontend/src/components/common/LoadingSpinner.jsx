import React, { useState, useEffect } from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Synchronizing Telemetry...', fullSequence = false }) => {
  const [step, setStep] = useState(0);

  const steps = [
    'Connecting Spark 3.5 & Analytical Fabric...',
    'Loading Karachi 110-Corridor Spatial Graph...',
    'Evaluating Model Inference Registry...',
    'Ingesting Real-Time Telemetry Stream...'
  ];

  useEffect(() => {
    if (!fullSequence) return;
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length);
    }, 800);
    return () => clearInterval(interval);
  }, [fullSequence, steps.length]);

  return (
    <div className="spinner-container hud-panel">
      <div className="hud-radar-spinner">
        <div className="radar-circle"></div>
        <div className="radar-beam"></div>
        <div className="radar-core"></div>
      </div>
      <div className="spinner-meta">
        <span className="spinner-brand">URBANTRANSIT // IQ</span>
        <div className="spinner-message">{fullSequence ? steps[step] : message}</div>
        <div className="spinner-progress-line">
          <div className="spinner-progress-glow"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;