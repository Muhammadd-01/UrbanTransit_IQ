import React, { useState, useEffect } from 'react';
import BackgroundParticles from '../components/common/BackgroundParticles';

const LandingPage = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark'; // default to light (white) if not set
  });

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'TOGGLE_THEME') {
        setIsDark(event.data.theme === 'dark');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', margin: 0, padding: 0, position: 'relative' }}>
      <BackgroundParticles />
      <iframe 
        src="/landing/index.htm" 
        title="UrbanTransit IQ Landing" 
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none', 
          display: 'block',
          position: 'relative',
          zIndex: 1,
          background: 'transparent'
        }}
        allowTransparency="true"
      />
    </div>
  );
};

export default LandingPage;
