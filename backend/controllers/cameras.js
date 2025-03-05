const Camera = require("../models/Camera");
const User = require("../models/User");

// Get all cameras
const getCameras = async (req, res) => {
  try {
    const cameras = await Camera.find();
    if (!cameras) {
      return res.status(400).json({ message: "No active cameras" });
    }
    res.status(200).json(cameras);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cameras", message: error.message });
  }
};

// Assign cameras to a user
const assignCameras = async (req, res) => {
    const userId = req.user.id;
    const cameraIds = req.cameras;

    if (!userId || !Array.isArray(cameraIds)) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure all cameras exist before assignment
        const cameras = await Camera.find({ _id: { $in: cameraIds } });
        if (cameras.length !== cameraIds.length) {
            return res.status(400).json({ message: 'One or more cameras not found' });
        }

        user.assignedCameras = cameraIds;
        await user.save();

        res.json({ message: 'Cameras assigned successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};