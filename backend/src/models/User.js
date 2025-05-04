const { Schema, model } = require("mongoose");

const sessionSchema = new Schema({
  refreshToken: {
    type: String,
    required: true
  },
  deviceInfo: {
    type: String,
    default: 'Unknown Device'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  }
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true,
  },
  superior: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  refreshToken: {
    type: String,
  },
  superior:{
    type:String,
    default: null,
  },
  assignedCameras:{
    type: [String],
    default: [],
  },
  // Track if user should only have one active session
  singleSessionOnly: {
    type: Boolean,
    default: true
  },
  // Active sessions array
  activeSessions: [sessionSchema]
});


const User = model("User", userSchema);

module.exports = User;