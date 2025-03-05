import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './authentication/ProtectedRoute';
import AdminPage from './pages/AdminPage/AdminPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Unauthorized from './pages/Unauthorized/Unauthorized';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import { useAuth } from './authentication/AuthProvider';
import { Navigate } from "react-router-dom";
import StatisticsPage from "./pages/StatisticsPage/StatisticsPage";
import AccidentHistoryPage from "./pages/AccidentHistory/AccidentHistory";
import LiveCameraPage from "./pages/LiveCameraPage/LiveCameraPage";
import ResetPassword from './pages/ResetPassword/ResetPassword';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ManageCameras from './pages/AdminPage/ManageCameras/ManageCameras';

function App() {
  const { user } = useAuth(); 
  const [accidents] = useState([]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user?.isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/manage-cameras" element={<ManageCameras />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard accidents={accidents} />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/history" element={<AccidentHistoryPage />} />
          <Route path="/live" element={<LiveCameraPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
