const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authLogs = require("../models/AuthLogs");
const { sendEmail } = require("../services/emailService");

// get user
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ role: userRole });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user", message: error.message });
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

// Request Password Change
const requestPasswordChange = async (req, res) => {
  try {
    console.log("Requesting password change...");
    const { username, email } = req.body;
    console.log(username, email);
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.email !== email) {
      return res.status(400).json({ message: "Invalid email" });
    }
    adminUsername = user.superior;
    const adminUser = await User.findOne( {username: adminUsername} );
    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found" });
    }
    const adminEmail = adminUser.email;
    console.log("adminEmail", adminEmail);  
    // Send an email to the admin
    const forgotPasswordEmail = {
      to: adminEmail,
      subject: "Password Reset Request",
      text: `A password reset request has been made for the user: ${username}`,
      html: `<p>A password reset request has been made for the user: ${username}</p>`,
    };
    await sendEmail(forgotPasswordEmail);
    res.status(200).json({ message: "Password reset request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send password reset request", error: error.message });
  }
};

// Export the handlers using module.exports
module.exports = {
    getUser,
    getRole,
    deleteUser,
    changePassword,
    requestPasswordChange
  };
  