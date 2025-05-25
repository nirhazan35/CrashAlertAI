import React, { useState, useEffect } from 'react';
import { useAuth } from '../../authentication/AuthProvider';
import { Button, Title, Container, Box, Text, MultiSelect } from '@mantine/core';
import { IconCamera, IconMapPin, IconUsers } from '@tabler/icons-react';
import { fetchUsers, addNewCamera } from '../AdminPage/AdminActions';
import '../authFormCSS/AuthForm.css';

const AddCamera = () => {
  const { user } = useAuth();
  const [cameraId, setCameraId] = useState('');
  const [location, setLocation] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await fetchUsers(user);
        setUsers(userData.map(u => ({ value: u._id, label: u.username })));
      } catch (error) {
        console.error('Error fetching users:', error);
        setSubmitStatus({ success: false, message: 'Failed to load users list' });
      }
    };
    loadUsers();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ success: null, message: '' });
    
    if (!cameraId || !location) {
      setSubmitStatus({ success: false, message: 'Camera ID and Location are required' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await addNewCamera(user, { cameraId, location, users: selectedUsers });
      
      setSubmitStatus({
        success: result.success,
        message: result.message || (result.success ? 'Camera added successfully!' : 'Failed to add camera')
      });

      if (result.success) {
        setCameraId('');
        setLocation('');
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Error adding camera:', error);
      setSubmitStatus({ success: false, message: 'An error occurred while adding the camera' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="auth-page">
      <Container size="xs">
        <div className="auth-container">
          <Title order={2} style={{ textAlign: 'center' }}>Add New Camera</Title>
          <div className="auth-subtitle">
            Register a new surveillance camera with the following details
          </div>

          {submitStatus.message && (
            <div className={`auth-message ${
              submitStatus.success ? 'auth-message-success' : 'auth-message-error'
            }`}>
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label className="auth-input-label">Camera Identifier</label>
              <div className="auth-input-wrapper">
                <IconCamera size="1rem" className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Enter unique camera identifier"
                  value={cameraId}
                  onChange={(e) => setCameraId(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Installation Location</label>
              <div className="auth-input-wrapper">
                <IconMapPin size="1rem" className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Enter camera location details"
                  value={location}
                  onChange={(e) => setLocation(e.currentTarget.value)}
                  className="auth-input"
                />
              </div>
            </div>

            <Text size="sm" weight={500} mb={4}>Assign Users (Optional)</Text>
              <MultiSelect
                size="sm"
                data={users}
                placeholder="Select users"
                value={selectedUsers}
                onChange={(value) => setSelectedUsers(value)}
                searchable
                clearable
                icon={<IconUsers size={16} />}
              />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              size="lg"
              style={{ marginTop: '1.5rem' }}
            >
              {isLoading ? "Adding Camera..." : "Register Camera"}
            </Button>
          </form>
        </div>
      </Container>
    </Box>
  );
};

export default AddCamera;