import React, { useState, useEffect } from 'react';
import {
  Paper,
  Title,
  TextInput,
  MultiSelect,
  Button
} from '@mantine/core';
import { useAuth } from '../../authentication/AuthProvider';
import { fetchUsers, addNewCamera } from '../AdminPage/AdminActions';
import '../authFormCSS/AuthForm.css';

const AddNewCamera = () => {
  const { user } = useAuth();

  const [cameraId, setCameraId] = useState('');
  const [location, setLocation] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({
    success: null,
    message: ''
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await fetchUsers(user);
        const userOptions = userData.map(u => ({
          value: u._id,
          label: u.username
        }));
        setUsers(userOptions);
      } catch (error) {
        console.error('Error fetching users:', error);
        setSubmitStatus({
          success: false,
          message: 'Failed to load users list'
        });
      }
    };
    loadUsers();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cameraId || !location) {
      setSubmitStatus({
        success: false,
        message: 'Camera ID and Location are required'
      });
      return;
    }

    try {
      const result = await addNewCamera(user, {
        cameraId,
        location,
        users: selectedUsers
      });

      setSubmitStatus({
        success: result.success,
        message: result.message || 'Failed to add camera'
      });

      if (result.success) {
        setCameraId('');
        setLocation('');
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Error adding camera:', error);
      setSubmitStatus({
        success: false,
        message: 'An error occurred while adding the camera'
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Paper component="form" onSubmit={handleSubmit} withBorder shadow="md" p="lg">
          <Title order={2}>Add New Camera</Title>

          <TextInput
            label="Camera Name"
            placeholder="Enter unique camera name/identifier"
            value={cameraId}
            onChange={(e) => setCameraId(e.currentTarget.value)}
            required
          />

          <TextInput
            label="Location"
            placeholder="Enter camera location"
            value={location}
            onChange={(e) => setLocation(e.currentTarget.value)}
            required
          />

          <MultiSelect
            label="Assign Users (Optional)"
            placeholder="Select users to assign to this camera"
            data={users}
            value={selectedUsers}
            onChange={setSelectedUsers}
            searchable
            clearable
          />

          <Button type="submit">
            Add Camera
          </Button>

          {submitStatus.message && (
            <div
              className={`auth-message ${
                submitStatus.success ? 'auth-message-success' : 'auth-message-error'
              }`}
            >
              {submitStatus.message}
            </div>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default AddNewCamera;
