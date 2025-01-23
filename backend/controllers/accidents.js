const Accident = require("../models/Accident");
const formatDate = require("../util/DateFormatting")
const { emitAccidentUpdate } = require("../services/socketService");

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
    const activeAccidents = await Accident.find({ status: { $in: ["active", "assigned"] } });

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
    const assignedTo = status === "assigned" ? req.user.username : null;

    if (!["active", "assigned", "handled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedAccident = await Accident.findByIdAndUpdate(
      id,
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



// Function to get handled accident logs
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


// Export the handlers using module.exports
module.exports = {
    saveNewAccident,
    getActiveAccidents,
    changeAccidentStatus,
    getHandledAccidents,
  };
  