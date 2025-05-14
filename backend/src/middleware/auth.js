const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded; // Attach user info to the request
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired Access Token", error: error.message });
    }
};

const verifyInternalSecret = (req, res, next) => {
    const secret = req.headers['x-internal-secret'];
    if (secret !== process.env.INTERNAL_SECRET) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    next();
}

// Middleware to authorize roles
function hasPermission(roles) {
  return async (req, res, next) => {
    try{
      const userRole = (await User.findById(req.user.id)).get('role');
      if (!userRole) {
        return res.status(400).json({ message: "Role not found for user" });
      }
    
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    } catch (error) {
      res.status(500).json({ error: "Failed to authorize user", message: error.message });
    }
  };
}

module.exports = { verifyToken, hasPermission, verifyInternalSecret };