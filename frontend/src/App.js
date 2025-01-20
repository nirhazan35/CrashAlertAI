import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './authentication/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Unauthorized from './pages/Unauthorized';
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './components/Logout';
import { useAuth } from './authentication/AuthProvider';
import { Navigate } from "react-router-dom";
import StatisticsPage from "./pages/StatisticsPage";
import AccidentHistoryPage from "./pages/AccidentHistoryPage";
import LiveCameraPage from "./pages/LiveCameraPage";
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';


function App() {
  const { user } = useAuth(); 
  return (
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={user?.isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/history" element={<AccidentHistoryPage />} />
              <Route path="/live" element={<LiveCameraPage />} />

              
            </Route>
          </Routes>
        </Router>
  );
}

export default App;