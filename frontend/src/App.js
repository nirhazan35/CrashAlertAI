import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './authentication';
import ProtectedRoute from './ProtectedRoute';
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
