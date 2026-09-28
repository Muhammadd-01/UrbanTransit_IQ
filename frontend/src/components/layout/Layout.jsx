import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

import { PipelineContext } from '../../contexts/PipelineContext';

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { isTrained, isAnalyzingSpark, isAnalyzingXgb } = React.useContext(PipelineContext);

  const isExemptRoute = 
    location.pathname === '/' || 
    location.pathname === '/dashboard' || 
    location.pathname === '/settings' || 
    location.pathname === '/profile' || 
    location.pathname === '/data-management' ||
    location.pathname === '/user-management';
  const showLockScreen = !isTrained && !isExemptRoute;

  return (
    <div className="layout" style={{ position: 'relative' }}>
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(prev => !prev)} 
      />
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header toggleSidebar={() => setIsSidebarCollapsed(prev => !prev)} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="page-content">
          {showLockScreen ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              <FaLock style={{ fontSize: '4rem', marginBottom: '20px', color: 'var(--color-border)' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--color-text)' }}>Intelligence Locked</h2>
              <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                {isAnalyzingSpark || isAnalyzingXgb 
                  ? "The machine learning pipeline is currently training on the database. Analytics will unlock automatically once complete."
                  : "Analytical data is hidden because the ML models have not been trained yet. Please return to the Dashboard and Execute the pipeline to process the 2M+ records."
                }
              </p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
