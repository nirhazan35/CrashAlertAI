/**
 * IP Processing Middleware
 * Handles extraction and cleaning of client IP addresses from various sources
 */

const ipProcessor = (req, res, next) => {
  // Get the real IP address from various sources
  let clientIP = req.ip || 
                req.headers['x-forwarded-for'] || 
                req.headers['x-real-ip'] ||
                req.connection.remoteAddress || 
                req.socket.remoteAddress ||
                (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                'Unknown';

  // Clean up IPv4-mapped IPv6 addresses
  if (typeof clientIP === 'string') {
    // Handle comma-separated IPs from x-forwarded-for (take the first one)
    if (clientIP.includes(',')) {
      clientIP = clientIP.split(',')[0].trim();
    }
    
    // Convert IPv4-mapped IPv6 to IPv4
    if (clientIP.startsWith('::ffff:')) {
      clientIP = clientIP.substring(7);
    }
    
    // Convert IPv6 loopback to IPv4 loopback for consistency
    if (clientIP === '::1') {
      clientIP = '127.0.0.1';
    }
  }

  // Override req.ip with cleaned IP
  req.ip = clientIP;
  next();
};

module.exports = ipProcessor; 