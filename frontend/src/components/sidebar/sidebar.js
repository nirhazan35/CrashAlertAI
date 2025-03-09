import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';
import { useAuth } from "../../authentication/AuthProvider";
import Logout from './logout';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Navigation</h2>
      <ul className="sidebar-menu">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/statistics">Statistics</Link>
        </li>
        <li>
          <Link to="/history">History</Link>
        </li>
        <li>
          <Link to="/live">Live Feed</Link>
        </li>
        {user?.role === 'admin' && (
          <li>
            <Link to="/admin">Admin Page</Link>
          </li>
        )}
        <li>
        <Logout />
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
