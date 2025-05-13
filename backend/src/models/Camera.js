const { Schema, model } = require("mongoose");

// Camera Schema
const cameraSchema = new Schema({
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
  activeAccidents: [{
    type: Schema.Types.ObjectId,
    ref: "Accident",
  }],
  accidentHistory: [{
    type: Schema.Types.ObjectId,
    ref: "Accident",
  }],
  users: [{
    type: Schema.Types.ObjectId,
    ref: "User",
    }],
  demoVideo: {
    type: String,
    default: null,
  },
});

const Camera = model("Camera", cameraSchema);

module.exports = Camera;
