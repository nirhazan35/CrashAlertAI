const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authLogs = require("../models/AuthLogs");


// Register
const register = async (req, res) => {
  try {
    console.log("Registering user..."); 
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
      superior: adminUsername
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
  const { username, password } = req.body;
  const authLog = new authLogs();
  await authLog.initializeAndSave(username, "Login");
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        // Create Access Token
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        // Create Refresh Token
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // Save Refresh Token in the database
        user.refreshToken = refreshToken;
        await user.save();
        // Set the Refresh Token in an HTTP-only cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
        });
        await authLog.updateResult("Success");
        res.status(200).json({ "accessToken" : accessToken });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};


// Logout
const logout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(204).send(); // No content
    }

    const refreshToken = cookies.jwt;

    // Find the user by refresh token and clear it
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
      return res.status(204).send(); // No content
    }

    user.refreshToken = null;
    await user.save();

    // Clear the refresh token cookie
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(401).json({ message: "Refresh Token not found" });
    }
    const refreshToken = cookies.jwt;
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    // Generate a new Access Token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired Refresh Token", error: error.message });
  }
};




// Export the handlers using module.exports
module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
