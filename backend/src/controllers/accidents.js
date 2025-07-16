const Accident = require("../models/Accident");
const formatDateTime = require("../util/DateFormatting");
const { emitAccidentUpdate, emitNotification, emitNewAccident } = require("../services/socketService");
const User = require("../models/User");
const Camera = require("../models/Camera");

const saveNewAccident = async (req, res) => {
  try {
    const { cameraId, location, date, severity, video, status, falsePositive, assignedTo } = req.body;

    // Validate required fields
    if (!cameraId || !location || !severity) {
      return res.status(400).json({
        success: false,
        message: "cameraId, location, and severity are required.",
      });
    }

    // Create a new Accident document
    const newAccident = new Accident({
      cameraId,
      location,
      date: date || new Date(),
      severity,
      video,
      assignedTo: assignedTo || null,
      status: status || 'active',
      falsePositive: falsePositive || 'false',
    });

    // Format date & time using DateFormatting util
    const { displayDate, displayTime } = formatDateTime(newAccident.date);
    newAccident.displayDate = displayDate;
    newAccident.displayTime = displayTime;

    // Save the accident and send a response
    const savedAccident = await newAccident.save();
    emitNewAccident(savedAccident);
    return res.status(201).json({
      success: true,
      message: "New accident saved successfully.",
      data: savedAccident,
    });
  } catch (error) {
    console.error("Error saving accident:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while saving the accident.",
      error: error.message,
    });
  }
};


const getActiveAccidents = async (req, res) => {
  try {
    // Query the database to find accidents with status "active" or "assigned"
    const activeAccidents = await Accident.find({ status: { $in: ["active", "assigned"] } });

    // Get user with their assigned cameras in a single query
    const user = await User.findById(req.user.id).select('assignedCameras');

    if (!user || !user.assignedCameras || user.assignedCameras.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No cameras assigned to this user.",
        data: [],
      });
    }

    // Filter accidents by assigned cameras without additional DB queries
    const assignedCameraIds = user.assignedCameras.map(cam => cam.toString());
    const filteredAccidents = activeAccidents.filter(accident =>
      assignedCameraIds.includes(accident.cameraId.toString())
    );

    res.status(200).json({
      success: true,
      message: "Active accidents retrieved successfully.",
      data: filteredAccidents,
    });
  } catch (error) {
    console.error("Error fetching active accidents:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving active accidents.",
      error: error.message,
    });
  }
};

const changeAccidentStatus = async (req, res) => {
  try {
    const { accident_id, status } = req.body;
    const username = (await User.findById(req.user.id)).get('username');

    if (!["active", "assigned", "handled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Prepare update object based on status
    const updateData = { status };
    
    if (status === "assigned") {
      // When assigning, set assignedTo to current user
      updateData.assignedTo = username;
    } else if (status === "active") {
      // When making active (unassigning), clear assignedTo
      updateData.assignedTo = null;
    }
    // For "handled" status, keep the current assignedTo value (don't modify it)

    const updatedAccident = await Accident.findByIdAndUpdate(
      accident_id,
      updateData,
      { new: true }
    );
    
    if (!updatedAccident) {
      return res.status(404).json({ message: "Accident not found" });
    }
    
    // Notify clients
    emitAccidentUpdate(updatedAccident);
    res.status(200).json(updatedAccident);
  } catch (error) {
    console.error("Error updating accident status:", error);
    res.status(500).json({ message: "An error occurred while updating accident status" });
  }
};

const getHandledAccidents = async (req, res) => {
  try {
    // Query the database for accidents with status 'handled'
    const handledAccidents = await Accident.find({ status: 'handled' });

    // Respond with the data
    res.status(200).json({ success: true, data: handledAccidents });
  } catch (error) {
    console.error('Error fetching handled accidents:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Optimized version that doesn't fetch user data every time
const filterAccidentsByUser = async(tokenUser, accidents) => {
  try {
    // Cache this result when possible instead of querying each time
    const user = await User.findById(tokenUser.id).select('assignedCameras');

    if (!user || !user.assignedCameras || user.assignedCameras.length === 0) {
      console.warn("User or assignedCameras not found.");
      return [];
    }

    const assignedCameraIds = user.assignedCameras.map(cam => cam.toString());
    return accidents.filter(accident =>
      assignedCameraIds.includes(accident.cameraId.toString())
    );
  } catch (error) {
    console.error("Error filtering accidents by user:", error);
    return [];
  }
};

const updateAccidentDetails = async (req, res) => {
  try {
    const { accident_id, severity, description, falsePositive } = req.body;
    const username = (await User.findById(req.user.id)).get('username');

    // Validate severity if provided
    if (severity && !['low', 'medium', 'high'].includes(severity.toLowerCase())) {
      return res.status(400).json({ message: "Invalid severity value" });
    }

    const currentAccident = await Accident.findById(accident_id);
    if (!currentAccident) {
      return res.status(404).json({ message: "Accident not found" });
    }

    const updateData = {};
    if (severity) updateData.severity = severity.toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (typeof falsePositive === 'boolean') updateData.falsePositive = falsePositive;

    const updatedAccident = await Accident.findByIdAndUpdate(accident_id, updateData, { new: true });

    // Send notifications for relevant changes
    // Severity level changed
    if (severity && currentAccident.severity !== severity.toLowerCase()) {
      const notificationData = {
        accidentId: accident_id,
        msg: `Accident severity level was changed from ${currentAccident.severity} to ${severity.toLowerCase()} by ${username}`
      };
      emitNotification(notificationData);
    }

    // Case 2: Marked as false positive
    if (typeof falsePositive === 'boolean' && falsePositive === true && !currentAccident.falsePositive) {
      const notificationData = {
        accidentId: accident_id,
        msg: `Accident was marked as false positive by ${username}`
      };
      emitNotification(notificationData);
    }

    // Emit update to clients
    emitAccidentUpdate(updatedAccident);
    res.status(200).json(updatedAccident);
  } catch (error) {
    console.error("Error updating accident details:", error);
    res.status(500).json({ message: "Error updating accident details", error: error.message });
  }
};

const runInference = async (req, res) => {
  try {
    const { videoId, cameraId } = req.body;
    if (!videoId || !cameraId) {
      return res.status(400).json({ message: "videoId and cameraId are required" });
    }

    // Find the camera object by cameraId
    const camera = await Camera.findOne({ cameraId });
    if (!camera) {
      return res.status(404).json({ message: `Camera with cameraId ${cameraId} not found` });
    }
    const location = camera.location;

    // Compose model-service URL and secret
    const modelServiceUrl = process.env.MODEL_SERVICE_URL || "http://localhost:8000/run";
    const internalSecret = process.env.INTERNAL_SECRET;

    // Use fetch (assume global or polyfilled)
    const response = await fetch(modelServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-INTERNAL-SECRET": internalSecret,
      },
      body: JSON.stringify({ videoId, cameraId, location }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: data.detail || data.message || "Model service error", error: data });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error running inference:", error);
    res.status(500).json({ message: "Error running inference", error: error.message });
  }
};

const getVideos = async (req, res) => {
  try {
    const modelServiceUrl = process.env.MODEL_SERVICE_VIDEOS_URL || "http://localhost:8000/videos";
    const internalSecret = process.env.INTERNAL_SECRET;

    const response = await fetch(modelServiceUrl, {
      method: "GET",
      headers: {
        "X-INTERNAL-SECRET": internalSecret,
      },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return res.status(response.status).json({ success: false, message: data.detail || data.message || "Model service error", error: data });
    }
    const videos = await response.json();

    if (!Array.isArray(videos) || videos.length === 0) {
      return res.status(200).json({ success: false, message: "No videos found.", data: [] });
    }

    const formattedVideos = videos.map(v => ({
      id: v.id,
      file: v.file,
      cameraId: v.cameraId || null,
      location: v.location || null,
      name: v.name || v.file,
      thumbnailUrl: v.thumbnailUrl || undefined,
    }));

    res.status(200).json({ success: true, data: formattedVideos });
  } catch (error) {
    console.error("Error fetching videos from model-service:", error);
    res.status(500).json({ success: false, message: "Error fetching videos", error: error.message });
  }
};

module.exports = {
  saveNewAccident,
  getActiveAccidents,
  changeAccidentStatus,
  getHandledAccidents,
  updateAccidentDetails,
  filterAccidentsByUser,
  runInference,
  getVideos,
};