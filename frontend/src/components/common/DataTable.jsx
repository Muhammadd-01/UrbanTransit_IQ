import React, { useState, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './DataTable.css';

const DataTable = ({ 
  columns, 
  data = [], 
  pageSize = 10,
  searchable = true,
  searchPlaceholder = "Filter records by any field...",
  onRowClick,
  emptyMessage = "No matching records found in telemetry store."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => 
      columns.some(col => {
        const val = row[col.accessor];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, columns]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (accessor) => {
    setSortConfig(prev => {
      if (prev.key === accessor) {
        return {
          key: accessor,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key: accessor, direction: 'asc' };
    });
  };

  return (
    <div className="hud-data-table-wrapper">
      {searchable && (
        <div className="table-search-bar">
          <div className="table-search-input-box">
            <FaSearch className="table-search-icon" />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="table-records-counter">
            <span className="mono-val text-cyan">{filteredData.length}</span>
            <span className="text-dim"> / {data.length} RECORDS</span>
          </div>
        </div>
      )}

      <div className="table-container hud-panel">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  onClick={() => col.sortable !== false && handleSort(col.accessor)}
                  className={col.sortable !== false ? 'sortable' : ''}
                  style={col.width ? { width: col.width } : {}}
                >
                  <div className="th-content">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="sort-icon">
                        {sortConfig.key === col.accessor ? (
                          sortConfig.direction === 'asc' ? <FaSortUp className="text-cyan" /> : <FaSortDown className="text-cyan" />
                        ) : (
                          <FaSort className="sort-idle" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr 
                  key={i} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  {columns.map((col, j) => (
                    <td key={j} className={col.isMono ? 'mono-val' : ''}>
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination-bar">
          <div className="pagination-info">
            PAGE <span className="mono-val text-cyan">{currentPage}</span> OF <span className="mono-val">{totalPages}</span>
          </div>
          <div className="pagination-controls">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft /> Prev
            </button>
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;