import React, { useContext } from 'react';
import { FilterContext } from '../../contexts/FilterContext';
import { FaFilter, FaRedo, FaCalendarAlt, FaRoute } from 'react-icons/fa';
import './FilterBar.css';

const FilterBar = () => {
  const { filters, updateFilter, resetFilters } = useContext(FilterContext);

  return (
    <div className="filter-bar">
      <div className="filter-label-group">
        <FaFilter className="filter-main-icon" />
        <span>NETWORK SLICE:</span>
      </div>

      <div className="filter-controls">
        <div className="filter-item">
          <FaRoute className="filter-item-icon" />
          <select 
            value={filters?.routeId || ''} 
            onChange={(e) => updateFilter('routeId', e.target.value || null)}
          >
            <option value="">All Karachi Routes (110)</option>
            <option value="PB-01">PB-01 (Peoples Bus: Model Colony - Tower)</option>
            <option value="GL-01">GL-01 (Green Line BRT: Surjani - Numaish)</option>
            <option value="PB-08">PB-08 (Korangi - Saddar)</option>
            <option value="LB-04">LB-04 (Liaquatabad Mixed)</option>
            <option value="LB-14">LB-14 (Hawksbay Feeder)</option>
          </select>
        </div>

        <div className="filter-item">
          <FaCalendarAlt className="filter-item-icon" />
          <input 
            type="date" 
            value={filters?.dateStart || ''}
            onChange={(e) => updateFilter('dateStart', e.target.value || null)}
            title="Start Date"
          />
        </div>

        <div className="filter-item">
          <select 
            value={filters?.isPeak !== undefined ? String(filters.isPeak) : ''}
            onChange={(e) => updateFilter('isPeak', e.target.value === '' ? null : e.target.value === 'true')}
          >
            <option value="">All Day Parts (24H)</option>
            <option value="true">Peak Only (07-10 & 17-20)</option>
            <option value="false">Off-Peak Operations</option>
          </select>
        </div>

        <button onClick={resetFilters} className="btn-reset-filters" title="Clear Filters">
          <FaRedo /> Reset
        </button>
      </div>
    </div>
  );
};

export default FilterBar;