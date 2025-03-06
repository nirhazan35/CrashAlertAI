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
  result: {
    type: String,
    enum: ['Success', 'Failure'],
    required: true,
  },
});

// Instance method to initialize and save a log
authLogsSchema.methods.initializeAndSave = async function (username, type, result = 'Failure') {
  this.username = username || 'Unknown';
  this.type = type;
  this.result = result;

  return await this.save(); // Save the document to the database
};

authLogsSchema.methods.updateResult = async function (result) {
  this.result = result;
  return await this.save(); // Save the document to the database
};

const AuthLogs = model("AuthLogs", authLogsSchema);

module.exports = AuthLogs;
