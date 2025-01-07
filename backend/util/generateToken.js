const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token for a user.
 * @param {Object} payload - The payload to include in the token (user ID).
 * @param {String} secret - The JWT secret key.
 * @param {Object} options - Additional options for token generation (expiry).
 * @returns {String} - The signed JWT.
 */
const generateToken = (payload, secret=process.env.JWT_SECRET, options = {}) => {
  return jwt.sign(payload, secret, options);
};

module.exports = generateToken;
