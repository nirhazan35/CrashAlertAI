import { useEffect, useState } from "react";
import { Card, CardContent, Button, Select, MenuItem, Checkbox, FormControl, InputLabel } from "@mui/material";
import { fetchUsers, fetchCameras, fetchAssignedCameras, updateAssignedCameras } from "../AdminActions";
import { useAuth } from '../../../authentication/AuthProvider';
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

  const handleUserChange = async (event) => {
    const userId = event.target.value;
    setSelectedUser(userId);
    if (userId) {
      const assignedData = await fetchAssignedCameras(user, userId);
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
    <div className="manage-user-cameras-container">
      <h1>Manage User Cameras</h1>
      <FormControl fullWidth>
        <InputLabel>Select a User</InputLabel>
        <Select value={selectedUser || ""} onChange={handleUserChange}>
          <MenuItem value="">Select a User</MenuItem>
          {users.map((user) => (
            <MenuItem key={user._id} value={user._id}>
              {user.username}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedUser && (
        <Card className="mt-4">
          <CardContent>
            <h2 className="text-lg font-bold">Assign Cameras</h2>
            <div className="camera-selection-grid">
              {cameras.map((camera) => (
                <div key={camera._id} className="camera-item">
                  <span className="camera-id">{camera.cameraId}</span>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={assignedCameras.includes(camera.cameraId)}
                      onChange={() => handleCameraToggle(camera.cameraId)}
                    />
                    <span>{camera.name}</span>
                  </label>
                </div>
              ))}
            </div>
            <Button className="save-changes-btn" variant="contained" color="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageUserCameras;
