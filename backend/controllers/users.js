const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authLogs = require("../models/AuthLogs");

// get user
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ role: userRole });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user role", message: error.message });
  }
};

// get role
const getRole = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('role');
    const userRole = user.role;
    if (!userRole) {
      return res.status(400).json({ message: "Role not found for user" });
    }

    res.status(200).json({ role: userRole });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user role", message: error.message });
  }
};

// Export the handlers using module.exports
module.exports = {
    getUser,
    getRole,
  };
  