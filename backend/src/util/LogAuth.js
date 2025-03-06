const AuthLogs = require("../models/AuthLogs");

const logAuth = async (username, type, timeStamp, result) => {
    try {
        const newLog = new AuthLogs({ username, type, timeStamp, result });
        await newLog.save();
    } catch (error) {
        console.error("Error logging auth:", error);
    }
};

module.exports = logAuth;