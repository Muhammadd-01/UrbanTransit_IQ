import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import FilterBar from './FilterBar';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <FilterBar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default Layout;