const bcrypt = require("bcryptjs");
const Accident = require("../models/Accident");
const authLogs = require("../models/AuthLogs");
const jwt = require("jsonwebtoken");


// Save Accident
const saveAccident = async (accident) => {
    try {
      const { cameraId, location, date, severity, video } = accident;
    //   const authLog = new authLogs();
    //   await authLog.initializeAndSave(adminUsername, "Register"); // Initialize and save the log
  
      const newAccident = new Accident({
        cameraId,
        location,
        date,
        severity,
        video,
      });
      console.log("New Accident:", newAccident);
  
      const savedAccident = await newAccident.save();
      console.log("Accident saved:", savedAccident);
    //   await authLog.updateResult("Success"); // Update the log result to "Success"
    return savedAccident;
    } catch (error) {
        return false;
    }
  };

// Export the handlers using module.exports
module.exports = {
    saveAccident,
  };
  