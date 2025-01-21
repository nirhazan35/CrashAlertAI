const bcrypt = require("bcryptjs");
const Accident = require("../models/Accident");
const authLogs = require("../models/AuthLogs");
const jwt = require("jsonwebtoken");


// Save Accident
const saveNewAccident = async (req, res) => {
  try {
    const { cameraId, location, date, severity, video } = req.body;
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
      date: date || new Date(), // Use provided date or default to current date
      severity,
      video,
    });
    // Save the new accident to the database
    const savedAccident = await newAccident.save();
    // Respond with success and the saved accident data
    res.status(201).json({
      success: true,
      message: "New accident saved successfully.",
      data: savedAccident,
    });
  } catch (error) {
    console.error("Error saving accident:", error);
    // Respond with an error message
    res.status(500).json({
      success: false,
      message: "An error occurred while saving the accident.",
      error: error.message,
    });
  }
};

const getActiveAccidents = async (req, res) => {
  try {
    // Query the database to find accidents with status "active"
    const activeAccidents = await Accident.find({ status: "active" });
    // Send success response with the active accidents
    res.status(200).json({
      success: true,
      message: "Active accidents retrieved successfully.",
      data: activeAccidents,
    });

  } catch (error) {
    console.error("Error fetching active accidents:", error);

    // Send error response
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving active accidents.",
      error: error.message,
    });
  }
};

// Export the handlers using module.exports
module.exports = {
    saveNewAccident,
    getActiveAccidents
  };
  