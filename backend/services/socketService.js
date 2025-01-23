const { broadcastNewAccident, broadcastAccidentUpdate } = require("../socket");

// Wrapper for broadcasting new accidents
const emitNewAccident = (accidentData) => {
  broadcastNewAccident(accidentData);
};

// Wrapper for broadcasting accident updates
const emitAccidentUpdate = (updateData) => {
  broadcastAccidentUpdate(updateData);
};

module.exports = { emitNewAccident, emitAccidentUpdate };
