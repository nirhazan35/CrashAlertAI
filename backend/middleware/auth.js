const jwt = require("jsonwebtoken");

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
  return (req, res, next) => {
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = { verifyToken, hasPermission };