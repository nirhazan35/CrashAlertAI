/**
 * IP Processing Middleware
 * Handles extraction and cleaning of client IP addresses from various sources
 */

const ipProcessor = (req, res, next) => {
  const originalIP = req.ip;
  
  let clientIP = req.ip || 
                req.headers['x-forwarded-for'] || 
                req.headers['x-real-ip'] ||
                req.connection.remoteAddress || 
                req.socket.remoteAddress ||
                (req.connection.socket ? req.connection.socket.remoteAddress : null);

  if (!clientIP || clientIP === '') {
    clientIP = 'Unknown';
  } else if (typeof clientIP === 'string') {
    if (clientIP.includes(',')) {
      clientIP = clientIP.split(',')[0].trim();
    }
    
    if (clientIP.startsWith('::ffff:')) {
      const cleanedIP = clientIP.substring(7);
      if (process.env.NODE_ENV === 'development') {
        console.log(`IP Conversion: ${clientIP} -> ${cleanedIP}`);
      }
      clientIP = cleanedIP;
    }
    
    if (clientIP === '::1') {
      clientIP = '127.0.0.1';
    }

    if (clientIP === '') {
      clientIP = 'Unknown';
    }

    if (clientIP && clientIP !== 'Unknown') {
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipv4Regex.test(clientIP)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Invalid IP format detected: ${clientIP}, Original: ${originalIP}`);
        }
      }
    }
  } else {
    clientIP = 'Unknown';
  }

  req.ip = clientIP;
  next();
};

module.exports = ipProcessor; 