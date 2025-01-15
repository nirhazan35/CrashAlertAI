// DashboardLayout.js
import React from 'react';
import Sidebar from '../../components/sidebar/sidebar'; // Import the sidebar component
import './DashboardLayout.css'; // Optional CSS for styling

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
