const Accident = require("../models/Accident");
const formatDate = require("../util/DateFormatting")

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
    
    newAccident.displayDate = formatDate(newAccident.date);

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

const changeAccidentStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (status !== "active" && status !== "assigned" && status !== "handled") {
      res.status(400).json({ message: "Invalid status value" });
    }
    const updatedAccident = await Accident.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedAccident) {
       res.status(404).json({ message: "Accident not found" });
    }
        console.log("3");

     res.status(200).json({ message: "Accident status updated successfully" });
  } catch (error) {
    console.error("Error updating accident status:", error);
    res.status(500).json({ message: "An error occurred while updating accident status" });
  }

};

// Export the handlers using module.exports
module.exports = {
    saveNewAccident,
    getActiveAccidents,
    changeAccidentStatus,
  };
  