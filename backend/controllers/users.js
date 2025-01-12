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
    const userRole = (await User.findById(req.user.id)).get('role');
    if (!userRole) {
      return res.status(400).json({ message: "Role not found for user" });
    }

    res.status(200).json({ role: userRole });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user role", message: error.message });
  }
};


const deleteUser = async (req, res) => {
  try{
    const result = await User.findByIdAndDelete(req.user.id);
    console.log('User deleted:', result);
    } catch (error){
    res.status(500).json({ error: "Failed to delete user", message: error.message });
  }
};

const changePassword = async(req, res) => {
  try {
    const { id, newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt();
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = newHashedPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update password", message: error.message });
  }
};



// Export the handlers using module.exports
module.exports = {
    getUser,
    getRole,
    deleteUser,
    changePassword,
    requestPasswordChange,
  };
  