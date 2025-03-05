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
  displayDate: {
    type: String,
    default: null,
  },
  displayTime: {
    type: String,
    default: null,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  video: {
    type: String, // Link to stored image/video of the detected event
  },
  description: {
    type: String,
    default: null,
  },
  assignedTo: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'assigned', 'handled'],
    default: 'active',
  },
  falsePositive: {
    type: Boolean,
    default: false,
  },
});

const Accident = model("Accident", accidentSchema);

module.exports = Accident;
