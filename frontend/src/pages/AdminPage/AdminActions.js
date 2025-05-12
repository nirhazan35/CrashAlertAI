import { useAuth } from "../../authentication/AuthProvider";

export const fetchUsers = async (user) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/users/get-all-users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const fetchCameras = async (user) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/cameras/get-cameras`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching cameras:", error);
    return [];
  }
};

export const fetchAssignedCameras = async (user, userId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/users/get-assigned-cameras?userId=${userId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    return data.assignedCameras;
  } catch (error) {
    console.error("Error fetching assigned cameras:", error);
    return [];
  }
};

export const updateAssignedCameras = async (user, userId, cameraIds) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/cameras/assign-cameras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ userId, cameraIds }),
    });
    if (response.status === 200){
        alert("Assigned cameras changed successfully");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating assigned cameras:", error);
  }
};

export const addNewCamera = async (user, cameraData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/cameras/add-new-camera`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cameraData),
    });

    const result = await response.json();

    if (result.success) {
      alert("Camera added successfully");
    }

    return result;
  } catch (error) {
    console.error("Error adding new camera:", error);
    throw error;
  }
};