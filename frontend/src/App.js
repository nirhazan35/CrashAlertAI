import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './authentication/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import Login from './pages/Login';
import { useAuth } from './authentication/AuthProvider';
import { Navigate } from "react-router-dom";


function App() {
  const user = useAuth().user;
  return (
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={user?.isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />

            <Route path="/unauthorized" element={<Unauthorized />} />


            {/* Protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </Router>
  );
}

export default App;