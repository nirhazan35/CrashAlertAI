const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authLogs = require("../models/AuthLogs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../services/emailService");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(400).json({ message: "No users found" });
    }
    const users_res = users.map((user) => {
      const userObject = user.toObject();
      delete userObject.refreshToken;
      return userObject;
    });
    res.status(200).json(users_res);
  } catch (error) {
    res.status(500).json({ error: "Failed to get users", message: error.message });
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
    const { token, newPassword } = req.body;
    const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { id } = data;
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
    const { username, email } = req.body;
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
    const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
    const resetLink = `${process.env.REACT_APP_URL_FRONTEND}/reset-password?token=${token}`;

    // Send an email to the admin
    const forgotPasswordEmail = {
      to: adminEmail,
      subject: "Password Reset Request",
      text: `A password reset request has been made for the user: ${username}, click the link below to reset the password: ${resetLink}`,
      html: `<p>A password reset request has been made for the user: ${username}, click the link below to reset the password: <a href="${resetLink}">${resetLink}</a></p>`,
    };
    await sendEmail(forgotPasswordEmail);
    res.status(200).json({ message: "Password reset request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send password reset request", error: error.message });
  }
};

const notifyPasswordChange = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { id } = data;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const email = user.email;
    const emailData = {
      to: email,
      subject: "Password Change Notification",
      text: `Your password has been changed successfully. your new password is: ${newPassword}`,
      html: `<p>Your password has been changed successfully. your new password is: ${newPassword}</p>`,
    };
    await sendEmail(emailData);
    res.status(200).json({ message: "Password change notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send password change notification", error: error.message });
  }
};

// Get assigned cameras of a user
const getAssignedCameras = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId).populate('assignedCameras');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ assignedCameras: user.assignedCameras });
    } catch (error) {
        res.status(500).json({ message: "Failed to get assigned cameras", error: error.message });
    }
};

// Export the handlers using module.exports
module.exports = {
    getAllUsers,
    getRole,
    deleteUser,
    changePassword,
    requestPasswordChange,
    notifyPasswordChange,
    getAssignedCameras,
  };
  