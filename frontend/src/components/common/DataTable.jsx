import React from 'react';
import './DataTable.css';

const DataTable = ({ columns, data }) => {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>{columns.map((col, i) => <th key={i}>{col.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col, j) => <td key={j}>{row[col.accessor]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default DataTable;