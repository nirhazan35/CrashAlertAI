import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './authentication/ProtectedRoute';
import AdminPage from './pages/AdminPage/AdminPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Unauthorized from './pages/Unauthorized/Unauthorized';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import { useAuth } from './authentication/AuthProvider';
import StatisticsPage from "./pages/StatisticsPage/StatisticsPage";
import AccidentHistoryPage from "./pages/AccidentHistory/AccidentHistory";
import LiveCameraPage from "./pages/LiveCameraPage/LiveCameraPage";
import ResetPassword from './pages/ResetPassword/ResetPassword';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import DeleteUser from './pages/deleteUser/deleteUser';
import ManageCameras from './pages/ManageCameras/ManageCameras';
import AddNewCamera from './pages/AddNewCamera/AddCamera';
import SidebarLayout from './components/sidebar/SidebarLayout';
import RequestPasswordChange from './pages/RequestPasswordChange/RequestPasswordChange';
import AuthLogs from './pages/AuthLogs/AuthLogs';
import Health from './pages/Health/Health';
import MantineProvider from './components/MantineProvider/MantineProvider';
import RunInference from './pages/AdminPage/RunInference';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {
  const { user } = useAuth();
  const [accidents] = useState([]);

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/health" element={<Health />} />
          <Route path="/login" element={user?.isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/request-password-change" element={<RequestPasswordChange />} />
          
          {/* Sidebar Layout Wrapper for Protected Routes */}
          <Route element={<SidebarLayout />}>
            <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard accidents={accidents} />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/history" element={<AccidentHistoryPage />} />
              <Route path="/live" element={<LiveCameraPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/manage-cameras" element={<ManageCameras />} />
              <Route path="/logs" element={<AuthLogs />} />
              <Route path="/delete-user" element={<DeleteUser />} />
              <Route path="/add-new-camera" element={<AddNewCamera />} />
              <Route path="/run-inference" element={<RunInference />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
