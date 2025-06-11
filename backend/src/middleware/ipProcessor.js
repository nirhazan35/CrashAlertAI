/**
 * IP Processing Middleware
 * Handles extraction and cleaning of client IP addresses from various sources
 */

const ipProcessor = (req, res, next) => {
  // Store original IP for debugging
  const originalIP = req.ip;
  
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
      const cleanedIP = clientIP.substring(7);
      // Log the conversion for debugging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log(`IP Conversion: ${clientIP} -> ${cleanedIP}`);
      }
      clientIP = cleanedIP;
    }
    
    // Convert IPv6 loopback to IPv4 loopback for consistency
    if (clientIP === '::1') {
      clientIP = '127.0.0.1';
    }

    // Validate the cleaned IP
    if (clientIP && clientIP !== 'Unknown') {
      // Basic IPv4 validation
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipv4Regex.test(clientIP)) {
        // If it's not a valid IPv4, log it for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`Invalid IP format detected: ${clientIP}, Original: ${originalIP}`);
        }
      }
    }
  }

  // Override req.ip with cleaned IP
  req.cleanedIp = clientIP;
  next();
};

module.exports = ipProcessor; 