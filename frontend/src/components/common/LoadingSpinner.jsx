import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <div className="spinner-message">{message}</div>
  </div>
);
export default LoadingSpinner;