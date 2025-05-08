import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Paper, Typography, Container, Box } from "@mui/material";
import './AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();

  const handleManageCamerasClick = () => {
    navigate('/manage-cameras');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleResetPasswordClick = () => {
    navigate('/reset-password');
  };

  return (
    <div className="admin-page">
      <Container maxWidth="lg" className="admin-container">
        <Paper className="admin-welcome-card">
          <Box className="admin-content">
            <Typography variant="h3" className="admin-title">
              Welcome, Admin!
            </Typography>
            <Typography variant="subtitle1" className="admin-subtitle">
              Manage your system settings and configurations
            </Typography>
            
            <Box className="admin-actions">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleManageCamerasClick}
                className="admin-button"
                size="large"
              >
                Manage User Cameras
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRegisterClick}
                className="admin-button"
                size="large"
              >
                Register New User
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleResetPasswordClick}
                className="admin-button"
                size="large"
              >
                Reset Password
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default AdminPage;
