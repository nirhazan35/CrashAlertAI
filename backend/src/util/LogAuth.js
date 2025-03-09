const AuthLogs = require("../models/AuthLogs");

const logAuth = async (username, type, timeStamp, result) => {
  try {
    const newLog = new AuthLogs({ username, type, timeStamp, result });
    return await newLog.save();
  } catch (error) {
    console.error("Error logging auth:", error);
    throw error;
  }
};

module.exports = logAuth;
