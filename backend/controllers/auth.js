const bcrypt = require("bcryptjs");
const User = require("../models/User");

const jwt = require("jsonwebtoken");
const authLogs = require("../models/AuthLogs");


// Register
const register = async (req, res) => {
  try {
    const adminUsername = (await User.findById( req.user.id )).get('username');
    const authLog = new authLogs();
    await authLog.initializeAndSave(adminUsername, "Register"); // Initialize and save the log
    const { username, email, password, role } = req.body;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      role,
    });

    // Check unique fields
    if (await User.findOne({ username: newUser.username })) {
      throw new Error(`Username already exists.`);
    }
    if (await User.findOne({ email: newUser.email })) {
      throw new Error(`Email already exists.`);
    }

    const savedUser = await newUser.save();
    await authLog.updateResult("Success"); // Update the log result to "Success"
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user", message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const authLog = new authLogs();
    await authLog.initializeAndSave(username, "Login"); // Initialize and save the log
    const user = await User.findOne({ username });
    if (!user) {

       // Log the failure

      return res.status(400).json({ error: "Username does not exist." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {


       // Log the failure

      return res.status(400).json({ error: "Invalid password." });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await authLog.updateResult("Success"); // Update the log result to "Success"
    res.cookie('token', token, { httpOnly: true}); // Store token in cookie
    res.status(200).json({ message: 'Login successful' });
    

  } catch (error) {
     // Log the failure
    res.status(500).json({ error: "Failed to login user", message: error.message });
  }
};

// Logout
const logout = async (req, res) => {

  const authLog = new authLogs();
  await authLog.initializeAndSave(req.user.username, "Logout"); // Initialize and save the log
  try {
    res.clearCookie('token');
    authLog.updateResult("Success"); // Update the log result to "Success"
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export the handlers using module.exports
module.exports = {
  register,
  login,
  logout,
};
