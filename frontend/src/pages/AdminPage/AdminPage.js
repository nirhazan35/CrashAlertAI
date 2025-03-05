import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@mui/material";

const AdminPage = () => {
  const navigate = useNavigate();

  const handleManageCamerasClick = () => {
    navigate('/manage-cameras');
  };

  return (
    <div>
      <h2>Welcome, Admin!</h2>
      <Button variant="contained" color="primary" onClick={handleManageCamerasClick}>
        Manage User Cameras
      </Button>
    </div>
  );
};

export default AdminPage;
