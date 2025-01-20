// DashboardLayout.js
import React from 'react';
import Sidebar from '../../components/sidebar/sidebar';
import './SidebarLayout.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
