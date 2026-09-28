import React, { useContext, useState, useEffect } from 'react';
import { FilterContext } from '../../contexts/FilterContext';
import { analyticsAPI } from '../../api/client';
import { FaFilter, FaRedo, FaCalendarAlt, FaRoute, FaClock } from 'react-icons/fa';
import './FilterBar.css';

const FilterBar = () => {
  const { filters, updateFilter, resetFilters } = useContext(FilterContext);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    analyticsAPI.getRoutes()
      .then(res => {
        if (res.data && res.data.routes) {
          setRoutes(res.data.routes.sort());
        }
      })
      .catch(err => {
        console.error('Failed to fetch routes', err);
      });
  }, []);

  return (
    <div className="filter-bar">
      <div className="filter-label-group">
        <FaFilter className="filter-main-icon" />
        <span className="filter-label-text">ANALYTICAL SLICE</span>
      </div>

      <div className="filter-controls">
        <div className="filter-item">
          <FaRoute className="filter-item-icon" />
          <select 
            value={filters?.routeId || ''} 
            onChange={(e) => updateFilter('routeId', e.target.value || null)}
          >
            <option value="">All Karachi Corridors ({routes.length > 0 ? routes.length : "..."} Routes)</option>
            {routes.map(route => (
              <option key={route} value={route}>{route}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <FaCalendarAlt className="filter-item-icon" />
          <input 
            type="date" 
            value={filters?.dateStart || ''}
            onChange={(e) => updateFilter('dateStart', e.target.value || null)}
            title="Temporal Boundary Start Date"
          />
        </div>

        <div className="filter-item">
          <FaClock className="filter-item-icon" />
          <select 
            value={filters?.isPeak !== undefined ? String(filters.isPeak) : ''}
            onChange={(e) => updateFilter('isPeak', e.target.value === '' ? null : e.target.value === 'true')}
          >
            <option value="">Full 24-Hour Operations</option>
            <option value="true">Peak Commute Only (07-10 & 17-20)</option>
            <option value="false">Off-Peak Shoulder Transit</option>
          </select>
        </div>

        <button onClick={resetFilters} className="btn-reset-filters" title="Reset All Spatial & Temporal Filters">
          <FaRedo /> Reset
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
