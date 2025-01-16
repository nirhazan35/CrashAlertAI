import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // Wait until loading completes
  if (loading) {
    console.log("Loading...");
    return <div>Loading...</div>;
  }

  if (!user?.isLoggedIn) {
    console.log("User is not logged in");
    return <Navigate to="/login" />; // Redirect to login if not logged in
  }

  if (!allowedRoles.includes(user.role)) {
    console.log("User is not authorized");
    return <Navigate to="/unauthorized" />; // Redirect to unauthorized page
  }

  return <Outlet />; // Render the protected component
};

export default ProtectedRoute;
