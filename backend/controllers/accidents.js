const Accident = require("../models/Accident");
const formatDateTime = require("../util/DateFormatting");
const { emitAccidentUpdate } = require("../services/socketService");
const User = require("../models/User");

// Save Accident
const saveNewAccident = async (accident) => {
  try {
    const { cameraId, location, date, severity, video } = accident;

    // Validate required fields
    if (!cameraId || !location || !severity) {
      return {
        success: false,
        message: "cameraId, location, and severity are required.",
      };
    }

    // Create a new Accident document
    const newAccident = new Accident({
      cameraId,
      location,
      date: date || new Date(), // Use provided date or default to current date
      severity,
      video,
    });

    // Format and split date into displayDate and displayTime
    const { displayDate, displayTime } = formatDateTime(newAccident.date);
    newAccident.displayDate = displayDate;
    newAccident.displayTime = displayTime;

    // Save the new accident to the database
    const savedAccident = await newAccident.save();

    // Return success response with the saved accident
    return {
      success: true,
      message: "New accident saved successfully.",
      data: savedAccident,
    };
  } catch (error) {
    console.error("Error saving accident:", error);

    // Return error response
    return {
      success: false,
      message: "An error occurred while saving the accident.",
      error: error.message,
    };
  }
};

const getActiveAccidents = async (req, res) => {
  try {
    // Query the database to find accidents with status "active" or "assigned"
    const activeAccidents = await Accident.find({ status: { $in: ["active", "assigned"] } });

    res.status(200).json({
      success: true,
      message: "Active accidents retrieved successfully.",
      data: activeAccidents,
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
    const assignedTo = status === "assigned" ? username : null;

    if (!["active", "assigned", "handled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const updatedAccident = await Accident.findByIdAndUpdate(
      accident_id,
      { status, assignedTo },
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
    res.status(200).json({ success: true, data: handledAccidents });
  } catch (error) {
    console.error('Error fetching handled accidents:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  saveNewAccident,
  getActiveAccidents,
  changeAccidentStatus,
  getHandledAccidents,
};
