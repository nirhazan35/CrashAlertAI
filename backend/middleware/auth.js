const jwt = require("jsonwebtoken");
const {getRole} = require("../controllers/users");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user; // Attach decoded user info to the request
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
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
      res.status(500).json({ error: "Failed to get user role", message: error.message });
    }
  };
}

module.exports = { verifyToken, hasPermission };