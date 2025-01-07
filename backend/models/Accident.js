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
  detectedAt: {
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
  },
  imageUrl: {
    type: String, // Link to stored image/video of the detected event
  },
});

const Accident = model("Accident", accidentSchema);

module.exports = Accident;