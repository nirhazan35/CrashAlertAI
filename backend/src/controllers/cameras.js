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

// Get (cameraId,location) of all cameras
const getLocations = async (req, res) => {
    try {
        // Fetch only the cameraId and location fields from the Camera model
        const cameras = await Camera.find().select('cameraId location');

        if (!cameras || cameras.length === 0) {
          return res.status(400).json({ message: "No cameras found" });
        }

        // Return the list of cameraId and location
        res.status(200).json(cameras);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch camera locations", message: error.message });
      }
}

// Assign cameras to a user
const assignCameras = async (req, res) => {
  const userId = req.body.userId;
  const cameraIds = req.body.cameraIds;
  if (!userId || !Array.isArray(cameraIds)) {
      return res.status(400).json({ message: 'Invalid input' });
  }

  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Create case-insensitive regex patterns
      const patterns = cameraIds.map(id => new RegExp(`^${id}$`, 'i'));
      
      // Find cameras using case-insensitive match
      const cameras = await Camera.find({ 
          cameraId: { $in: patterns } 
      });
      
      if (cameras.length !== cameraIds.length) {
          // Find which IDs are missing
          const foundIds = cameras.map(cam => cam.cameraId.toLowerCase());
          const missingIds = cameraIds.filter(id => 
              !foundIds.includes(id.toLowerCase())
          );
          
          return res.status(400).json({ 
              message: 'One or more cameras not found',
              missing: missingIds
          });
      }

      // Get the EXACT camera IDs from database
      const exactCameraIds = cameras.map(cam => cam.cameraId);
      
      // Update camera assignments
      await Camera.updateMany(
          { cameraId: { $in: exactCameraIds } },
          { $addToSet: { users: userId } }
      );
      
      await Camera.updateMany(
          { cameraId: { $nin: exactCameraIds } },
          { $pull: { users: userId } }
      );
      
      // Save with exact case from database
      user.assignedCameras = exactCameraIds;
      await user.save();
      
      res.status(200).json({ message: 'Cameras assigned successfully' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const addNewCamera = async (req, res) => {
  try {
    const { cameraId, location, users } = req.body;

    // Validate required fields
    if (!cameraId || !location) {
      return res.status(400).json({
        success: false,
        message: "cameraId and location are required.",
      });
    }

    const camera = await Camera.findOne({ cameraId });
    if (camera) {
      return res.status(400).json({
        success: false,
        message: "Camera already exists.",
      });
    }

    // validate that provided user IDs exist
    let validUsers = [];
    if (users && Array.isArray(users)) {
      validUsers = await User.find({ _id: { $in: users } });
      if (validUsers.length !== users.length) {
        return res.status(400).json({
          success: false,
          message: "One or more user IDs are invalid.",
        });
      }
    }

    // Create and save the Camera document
    const newCamera = new Camera({
      cameraId,
      location,
      users: validUsers.map((user) => user._id),
    });

    const savedCamera = await newCamera.save();

    // Populate the users field
    const populatedCamera = await savedCamera.populate("users");

    return res.status(201).json({
      success: true,
      message: "New camera added successfully.",
      data: populatedCamera,
    });
  } catch (error) {
    console.error("Error saving camera:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while saving the camera.",
      error: error.message,
    });
  }
};


module.exports = {
  getCameras,
  getLocations,
  assignCameras,
  addNewCamera
};