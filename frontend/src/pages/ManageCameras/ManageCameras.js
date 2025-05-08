import { useEffect, useState } from "react";
import { Paper, Title, Select, Checkbox, Button, Stack, Text, Group } from '@mantine/core';
import { fetchUsers, fetchCameras, fetchAssignedCameras, updateAssignedCameras } from "../AdminPage/AdminActions";
import { useAuth } from '../../authentication/AuthProvider';
import './ManageCameras.css';

const ManageUserCameras = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignedCameras, setAssignedCameras] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const usersData = await fetchUsers(user);
      setUsers(usersData);
      const camerasData = await fetchCameras(user);
      setCameras(camerasData);
    };
    loadData();
  }, []);

  const handleUserChange = async (value) => {
    setSelectedUser(value);
    if (value) {
      const assignedData = await fetchAssignedCameras(user, value);
      setAssignedCameras(assignedData);
    }
  };

  const handleCameraToggle = (cameraId) => {
    setAssignedCameras((prev) =>
      prev.includes(cameraId)
        ? prev.filter((id) => id !== cameraId)
        : [...prev, cameraId]
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    await updateAssignedCameras(user, selectedUser, assignedCameras);
    setSelectedUser(null);
    setAssignedCameras([]);
  };

  return (
    <div className="manage-cameras-page">
      <div className="manage-cameras-container">
        <Paper className="manage-cameras-sidebar">
          <Stack spacing="md">
            <Title order={3}>User Selection</Title>
            <Select
              label="Select a User"
              placeholder="Choose a user"
              value={selectedUser}
              onChange={handleUserChange}
              data={users.map(user => ({
                value: user._id,
                label: user.username
              }))}
              clearable
            />
            {selectedUser && (
              <Button 
                onClick={handleSaveChanges}
                variant="filled"
                color="blue"
                fullWidth
              >
                Save Changes
              </Button>
            )}
          </Stack>
        </Paper>

        <Paper className="manage-cameras-main">
          {selectedUser ? (
            <Stack spacing="md">
              <Group position="apart" align="center">
                <Title order={2} className="manage-cameras-subtitle">Assign Cameras</Title>
                <Text size="sm" color="dimmed">
                  {assignedCameras.length} cameras assigned
                </Text>
              </Group>
              <div className="camera-selection-grid">
                {cameras.map((camera) => (
                  <div key={camera._id} className="camera-item">
                    <Text className="camera-id">Camera ID: {camera.cameraId}</Text>
                    <Checkbox
                      label={camera.name}
                      checked={assignedCameras.includes(camera.cameraId)}
                      onChange={() => handleCameraToggle(camera.cameraId)}
                      className="camera-name"
                    />
                  </div>
                ))}
              </div>
            </Stack>
          ) : (
            <Stack align="center" spacing="md" py="xl">
              <Text size="lg" color="dimmed" align="center">
                Select a user from the sidebar to manage their camera assignments
              </Text>
            </Stack>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default ManageUserCameras;
