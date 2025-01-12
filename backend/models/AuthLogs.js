const { Schema, model } = require("mongoose");

const authLogsSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Login', 'Logout'],
    required: true,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
  result: {
    type: String,
    enum: ['Success', 'Failure'],
    required: true,
  },
});

const AuthLogs = model("AuthLogs", authLogsSchema);

module.exports = AuthLogs;