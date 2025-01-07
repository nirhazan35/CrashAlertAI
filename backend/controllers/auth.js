const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Register
const register = async (req, res) => {
  try {
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
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user", message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Username does not exist." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password." });
    }

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).json({ message: "Login successful", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Failed to login user", message: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  try {
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
