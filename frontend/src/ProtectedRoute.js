import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authentication';


const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user.isLoggedIn) {
    return <Navigate to="/login" />; // Redirect to login if not logged in
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />; // Redirect to unauthorized page
  }

  return <Outlet />; // Render the protected component
};

export default ProtectedRoute;
