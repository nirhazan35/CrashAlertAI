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

  const handleDeleteUserClick = () => {
    navigate('/delete-user');
  };

  const handleAddNewCameraClick = () => {
    navigate('/add-new-camera');
  };

  const handleRunInferenceClick = () => {
    navigate('/run-inference');
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
                size="medium"
              >
                Manage User's Cameras
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddNewCameraClick}
                className="admin-button"
                size="medium"
              >
                Add New Camera
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRegisterClick}
                className="admin-button"
                size="medium"
              >
                Register New User
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleDeleteUserClick}
                className="admin-button"
                size="medium"
              >
                Delete User
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRunInferenceClick}
                className="admin-button"
                size="medium"
              >
                Run Inference
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default AdminPage;
