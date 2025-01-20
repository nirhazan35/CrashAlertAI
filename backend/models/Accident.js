const { Schema, model } = require("mongoose");

// Accident Detection Schema
const accidentSchema = new Schema({
  cameraId: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  video: {
    type: String, // Link to stored image/video of the detected event
  },
  assignedTo: {
    userid: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'assigned', 'handled'],
    default: 'active',
  },
});

const Accident = model("Accident", accidentSchema);

module.exports = Accident;