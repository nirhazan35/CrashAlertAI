// Dashboard.js
import React from 'react';
import DashboardLayout from './DashboardLayout';
import Logout from '../../components/Logout';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <h2>Welcome to the Dashboard!</h2>
      <p>This is the dashboard content area.</p>
      <Logout />
    </DashboardLayout>
  );
};

export default Dashboard;
