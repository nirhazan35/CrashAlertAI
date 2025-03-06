import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';

const SidebarLayout = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
