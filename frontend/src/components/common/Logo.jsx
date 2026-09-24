import React from 'react';

const Logo = ({ size = 34, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#007AFF" />
          <stop offset="100%" stopColor="#5E5CE6" />
        </linearGradient>
        <linearGradient id="greenGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34C759" />
          <stop offset="100%" stopColor="#30B0C7" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer Hexagon / Cube base */}
      <path 
        d="M50 5 L90 28 V72 L50 95 L10 72 V28 Z" 
        stroke="url(#blueGradient)" 
        strokeWidth="6" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(0, 122, 255, 0.05)"
      />
      
      {/* Dynamic Transit Lines inside */}
      <path 
        d="M30 40 L50 25 L70 40" 
        stroke="url(#greenGradient)" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#glow)"
      />
      <path 
        d="M30 60 L50 75 L70 60" 
        stroke="url(#blueGradient)" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Connectivity Nodes */}
      <circle cx="30" cy="40" r="5" fill="#34C759" />
      <circle cx="50" cy="25" r="5" fill="#007AFF" />
      <circle cx="70" cy="40" r="5" fill="#34C759" />
      <circle cx="30" cy="60" r="5" fill="#007AFF" />
      <circle cx="50" cy="75" r="5" fill="#5E5CE6" />
      <circle cx="70" cy="60" r="5" fill="#007AFF" />
      <circle cx="50" cy="50" r="6" fill="#FFFFFF" filter="url(#glow)" />
    </svg>
  );
};

export default Logo;
