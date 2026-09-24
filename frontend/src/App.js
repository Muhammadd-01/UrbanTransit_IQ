import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FilterProvider } from './contexts/FilterContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import DataManagement from './pages/DataManagement';
import DataQuality from './pages/DataQuality';
import PassengerFlow from './pages/PassengerFlow';
import ODAnalysis from './pages/ODAnalysis';
import RouteIntelligence from './pages/RouteIntelligence';
import DelayAnalytics from './pages/DelayAnalytics';
import Forecasting from './pages/Forecasting';
import Clustering from './pages/Clustering';
import AnomalyDetection from './pages/AnomalyDetection';
import VehicleAnalytics from './pages/VehicleAnalytics';
import Recommendations from './pages/Recommendations';
import WhatIfSimulator from './pages/WhatIfSimulator';
import ModelComparison from './pages/ModelComparison';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/data-quality" element={<DataQuality />} />
            <Route path="/passenger-flow" element={<PassengerFlow />} />
            <Route path="/od-analysis" element={<ODAnalysis />} />
            <Route path="/route-intelligence" element={<RouteIntelligence />} />
            <Route path="/delay-analytics" element={<DelayAnalytics />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/clustering" element={<Clustering />} />
            <Route path="/anomaly-detection" element={<AnomalyDetection />} />
            <Route path="/vehicle-analytics" element={<VehicleAnalytics />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/what-if-simulator" element={<WhatIfSimulator />} />
            <Route path="/model-comparison" element={<ModelComparison />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </FilterProvider>
    </AuthProvider>
  );
}

export default App;