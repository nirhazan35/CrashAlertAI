const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AuthLogs = require("../models/AuthLogs");
const { clients } = require("../socket");

// Register
const register = async (req, res) => {
  // Create a log entry at the start
  let authLog;
  try {
    const adminUsername = await User.findById(req.user.id).then(user => user.username);
    // Pass the request object to capture device and IP info
    authLog = new AuthLogs();
    await authLog.initializeAndSave(adminUsername, "Register", req);
    
    const { username, email, password, role } = req.body;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      role,
      superior: adminUsername,
    });

    // Check unique fields
    if (await User.findOne({ username: newUser.username })) {
      await authLog.updateResult("Failure", "Username already exists");
      return res.status(400).json({ error: "Registration failed", message: "Username already exists" });
    }
    if (await User.findOne({ email: newUser.email })) {
      await authLog.updateResult("Failure", "Email already exists");
      return res.status(400).json({ error: "Registration failed", message: "Email already exists" });
    }

    const savedUser = await newUser.save();
    await authLog.updateResult("Success");
    res.status(201).json(savedUser);
  } catch (error) {
    // Update the log with error details
    if (authLog) {
      await authLog.updateResult("Failure", error.message);
    } else {
      // If log creation failed, try to create a new failure log
      try {
        await AuthLogs.logFailure("Unknown Admin", "Register", req, error.message);
      } catch (logError) {
        console.error("Failed to create auth log:", logError);
      }
    }
    res.status(500).json({ error: "Failed to create user", message: error.message });
  }
};

// Login
const login = async (req, res) => {
  const { username, password } = req.body;
  let authLog;
  
  try {
    // Create log with request info for IP and device tracking
    authLog = new AuthLogs();
    await authLog.initializeAndSave(username, "Login", req);
      
    const user = await User.findOne({ username });
    if (!user) {
      await authLog.updateResult("Failure", "Invalid username");
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await authLog.updateResult("Failure", "Invalid password");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Get device info from user agent
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';

    // If single session only is enabled, invalidate all existing sessions
    if (user.singleSessionOnly && user.activeSessions.length > 0) {
      // Force disconnect all existing sockets for this user
      Object.keys(clients).forEach(socketId => {
        const socket = clients[socketId];
        if (socket && socket.user && socket.user.id === user.id.toString()) {
          console.log(`Forcing disconnect for previous session of user: ${user.username}`);
          socket.emit('force_logout', { message: 'You have been logged in from another device' });
          socket.disconnect(true);
        }
      });
      
      // Clear active sessions
      user.activeSessions = [];
    }

    // Create Access Token
    const accessToken = jwt.sign(
        { id: user.id, role: user.role, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    // Create Refresh Token
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );

    // Create a new session
    const newSession = {
      refreshToken,
      deviceInfo,
      lastActive: new Date(),
      ipAddress
    };

    // Add session to user's active sessions
    user.activeSessions.push(newSession);
    
    // For backward compatibility, also set the refreshToken field
    user.refreshToken = refreshToken;
    
    await user.save();

    // Set the Refresh Token in an HTTP-only cookie
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Update the log with success and add the session ID
    authLog.sessionId = refreshToken.slice(-10); // Store just part of the token for security
    await authLog.updateResult("Success");
    
    res.status(200).json({ 
      accessToken,
      // Send session data to client
      session: {
        deviceInfo,
        loginTime: new Date(),
        singleSessionOnly: user.singleSessionOnly
      }
    });
  } catch (error) {
    // Update the log with error details
    if (authLog) {
      await authLog.updateResult("Failure", error.message);
    } else {
      // If log creation failed, create a new failure log
      try {
        await AuthLogs.logFailure(username, "Login", req, error.message);
      } catch (logError) {
        console.error("Failed to create auth log:", logError);
      }
    }
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  const { username } = req.body;
  let authLog;
  
  try {
    // Create log with request info
    authLog = new AuthLogs();
    await authLog.initializeAndSave(username, "Logout", req);
    
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      await authLog.updateResult("Failure", "No refresh token found");
      return res.status(204).send(); // No content
    }
    
    const refreshToken = cookies.jwt;

    // Find the user by refresh token
    const user = await User.findOne({ 
      "activeSessions.refreshToken": refreshToken 
    });
    
    if (!user) {
      await authLog.updateResult("Failure", "Invalid session");
      res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
      return res.status(204).send(); // No content
    }
    
    // Add session ID to the log
    authLog.sessionId = refreshToken.slice(-10);
    
    // Remove the specific session
    user.activeSessions = user.activeSessions.filter(
      session => session.refreshToken !== refreshToken
    );
    
    // For backward compatibility
    user.refreshToken = null;
    
    await user.save();

    // Disconnect any socket connections for this token
    Object.keys(clients).forEach(socketId => {
      const socket = clients[socketId];
      if (socket?.user?.id === user.id.toString()) {
        console.log(`Disconnecting socket for user: ${user.username}`);
        socket.disconnect(true);
      }
    });

    // Clear the refresh token cookie
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    await authLog.updateResult("Success");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    // Update the log with error details
    if (authLog) {
      await authLog.updateResult("Failure", error.message);
    } else {
      // If log creation failed, create a new failure log
      try {
        await AuthLogs.logFailure(username, "Logout", req, error.message);
      } catch (logError) {
        console.error("Failed to create auth log:", logError);
      }
    }
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(401).json({ message: "Refresh Token not found" });
    }
    const refreshToken = cookies.jwt;
    
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      // Find user with this refresh token in their active sessions
      const user = await User.findOne({ 
        _id: decoded.id,
        "activeSessions.refreshToken": refreshToken 
      });
      
      if (!user) {
        return res.status(403).json({ message: "Session expired or invalid" });
      }
      
      // Update the session's last active timestamp
      const sessionIndex = user.activeSessions.findIndex(
        session => session.refreshToken === refreshToken
      );
      
      if (sessionIndex !== -1) {
        user.activeSessions[sessionIndex].lastActive = new Date();
        await user.save();
      }
      
      // Generate a new Access Token
      const accessToken = jwt.sign(
        { id: user.id, role: user.role, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
  
      res.json({ accessToken });
    } catch (err) {
      // Token validation failed
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error refreshing token", error: error.message });
  }
};

// Get authentication logs - only for admins
const getAuthLogs = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { 
      username, 
      type, 
      result, 
      startDate, 
      endDate, 
      ipAddress,
      browser,
      operatingSystem,
      ipAddressIncludeNull,
      browserIncludeNull,
      operatingSystemIncludeNull
    } = req.query;
    
    // Build the filter object
    const filter = {};
    
    // Add filters if they're provided
    if (username) filter.username = new RegExp(username, 'i'); // Case-insensitive partial match
    if (type) filter.type = type;
    if (result) filter.result = result;
    
    // Special handling for fields that need to include null/undefined values
    if (ipAddress) {
      if (ipAddress === 'Unknown' && ipAddressIncludeNull === 'true') {
        // Include actual "Unknown" values or null/undefined/empty values
        filter.ipAddress = { 
          $in: [null, 'Unknown', ''] 
        };
      } else {
        filter.ipAddress = new RegExp(ipAddress, 'i');
      }
    }
    
    if (browser) {
      if (browser === 'Unknown' && browserIncludeNull === 'true') {
        // Include actual "Unknown" values or null/undefined/empty values
        filter.browser = { 
          $in: [null, 'Unknown', ''] 
        };
      } else {
        filter.browser = browser;
      }
    }
    
    if (operatingSystem) {
      if (operatingSystem === 'Unknown' && operatingSystemIncludeNull === 'true') {
        // Include actual "Unknown" values or null/undefined/empty values
        filter.operatingSystem = { 
          $in: [null, 'Unknown', ''] 
        };
      } else {
        filter.operatingSystem = operatingSystem;
      }
    }
    
    // Date range filtering
    if (startDate || endDate) {
      filter.timeStamp = {};
      if (startDate) filter.timeStamp.$gte = new Date(startDate);
      if (endDate) {
        // Set the end date to the end of the day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.timeStamp.$lte = endDateTime;
      }
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Count total documents for pagination
    const totalLogs = await AuthLogs.countDocuments(filter);
    const totalPages = Math.ceil(totalLogs / limit);
    
    // Get the logs with pagination
    const logs = await AuthLogs.find(filter)
      .sort({ timeStamp: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total: totalLogs,
          pages: totalPages,
          page,
          limit
        }
      }
    });
  } catch (error) {
    console.error("Error retrieving auth logs:", error);
    res.status(500).json({
      success: false, 
      message: "Failed to retrieve authentication logs",
      error: error.message
    });
  }
};

// Export the handlers using module.exports
module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getAuthLogs
};
