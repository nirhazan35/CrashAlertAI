const AuthLogs = require("../models/AuthLogs");
const formatDateTime = require("../util/DateFormatting");

const logAuth = async (username, type, timeStamp, result) => {
  try {
    const date = timeStamp || new Date();
    const { displayDate, displayTime } = formatDateTime(date);

    const newLog = new AuthLogs({ 
      username, 
      type, 
      timeStamp: date, 
      displayDate, 
      displayTime, 
      result 
    });
    
    return await newLog.save();
  } catch (error) {
    console.error("Error logging auth:", error);
    throw error;
  }
};

module.exports = logAuth;
