import React, { createContext, useState } from 'react';

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    dateStart: null,
    dateEnd: null,
    routeId: null,
    stopId: null,
    vehicleId: null,
    direction: null,
    dayOfWeek: null,
    hour: null,
    isPeak: null
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      dateStart: null,
      dateEnd: null,
      routeId: null,
      stopId: null,
      vehicleId: null,
      direction: null,
      dayOfWeek: null,
      hour: null,
      isPeak: null
    });
  };

  const getFilterParams = () => {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== '') {
        params[key] = filters[key];
      }
    });
    return params;
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilter, resetFilters, getFilterParams }}>
      {children}
    </FilterContext.Provider>
  );
};