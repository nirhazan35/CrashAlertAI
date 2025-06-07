const { Schema, model } = require("mongoose");

const authLogsSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Login', 'Logout', 'Register'],
    required: true,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
  displayDate: {
    type: String,
    default: null,
  },
  displayTime: {
    type: String,
    default: null,
  },
  result: {
    type: String,
    enum: ['Success', 'Failure'],
    required: true,
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  deviceInfo: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  operatingSystem: {
    type: String,
    default: 'Unknown'
  },
  // Store any error message in case of failure
  errorMessage: {
    type: String,
    default: null
  },
  // For tracking session ID if applicable
  sessionId: {
    type: String,
    default: null
  },
  // Location data (can be populated via IP lookup if desired)
  location: {
    country: { type: String, default: null },
    city: { type: String, default: null },
    coordinates: {
      longitude: { type: Number, default: null },
      latitude: { type: Number, default: null }
    }
  }
});

// Enhanced method to initialize and save a log with request information
authLogsSchema.methods.initializeAndSave = async function (username, type, req = null, result = 'Failure') {
  // Apply date formatting to get displayDate and displayTime
  const formatDateTime = require("../util/DateFormatting");
  const { displayDate, displayTime } = formatDateTime(this.timeStamp || new Date());
  
  this.username = username || 'Unknown';
  this.type = type;
  this.result = result;
  this.displayDate = displayDate;
  this.displayTime = displayTime;
  
  // Extract additional information from request object if provided
  if (req) {
    // Get IP address (now cleaned by middleware)
    this.ipAddress = req.ip || 'Unknown';
                    
    // Get user agent info
    const userAgent = req.headers['user-agent'] || 'Unknown';
    this.deviceInfo = userAgent;
    
    // Extract browser and OS information from user agent (improved)
    // In production, you might want to use a library like ua-parser-js
    if (userAgent.includes('Firefox')) {
      this.browser = 'Firefox';
    } else if (userAgent.includes('Edg/')) { // Modern Edge
      this.browser = 'Edge';
    } else if (userAgent.includes('Edge/')) { // Legacy Edge
      this.browser = 'Edge';
    } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      this.browser = 'Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      this.browser = 'Safari';
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
      this.browser = 'Internet Explorer';
    }
    
    if (userAgent.includes('Windows NT')) {
      this.operatingSystem = 'Windows';
    } else if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
      this.operatingSystem = 'MacOS';
    } else if (userAgent.includes('X11') || userAgent.includes('Linux')) {
      this.operatingSystem = 'Linux';
    } else if (userAgent.includes('Android')) {
      this.operatingSystem = 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) {
      this.operatingSystem = 'iOS';
    }
  }

  return await this.save(); // Save the document to the database
};

// Update result with optional error message
authLogsSchema.methods.updateResult = async function (result, errorMessage = null) {
  this.result = result;
  if (errorMessage) {
    this.errorMessage = errorMessage;
  }
  return await this.save();
};

// Static method to create a success log in one step
authLogsSchema.statics.logSuccess = async function(username, type, req = null) {
  const formatDateTime = require("../util/DateFormatting");
  const now = new Date();
  const { displayDate, displayTime } = formatDateTime(now);

  const log = new this({
    username,
    type,
    result: 'Success',
    timeStamp: now,
    displayDate,
    displayTime
  });
  
  if (req) {
    await log.initializeAndSave(username, type, req, 'Success');
  } else {
    await log.initializeAndSave(username, type, null, 'Success');
  }
  
  return log;
};

// Static method to create a failure log in one step
authLogsSchema.statics.logFailure = async function(username, type, req = null, errorMessage = null) {
  const formatDateTime = require("../util/DateFormatting");
  const now = new Date();
  const { displayDate, displayTime } = formatDateTime(now);

  const log = new this({
    username,
    type,
    result: 'Failure',
    errorMessage,
    timeStamp: now,
    displayDate,
    displayTime
  });
  
  if (req) {
    await log.initializeAndSave(username, type, req, 'Failure');
  } else {
    await log.initializeAndSave(username, type, null, 'Failure');
  }
  
  return log;
};

const AuthLogs = model("AuthLogs", authLogsSchema);

module.exports = AuthLogs;
