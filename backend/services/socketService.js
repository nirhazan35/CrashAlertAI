const { broadcastNewAccident, broadcastAccidentUpdate, clients } = require("../socket");
const Camera = require("../models/Camera");


// Wrapper for broadcasting new accidents
const emitNewAccident = async (accidentData) => {
  try {
    // Get the camera object using cameraId from the accident
    const camera = await Camera.findOne({ cameraId: accidentData.cameraId }).populate("users");

    if (!camera) {
      console.error(`Camera with ID ${accidentData.cameraId} not found`);
      return;
    }

    // Get the list of user IDs associated with the camera
    const authorizedUserIds = camera.users.map(user => user.id); // Convert ObjectId to string

    // Broadcast to all sockets where client.keys() is in authorizedUserIds
    Object.keys(clients).forEach((socketId) => {
      const socket = clients[socketId];
      if (socket.user && authorizedUserIds.includes(socket.user.id)) {
        socket.emit("new_accident", accidentData);
      }
    });

    console.log(`Accident dispatched to ${authorizedUserIds.length} users`);
  } catch (error) {
    console.error("Error emitting new accident:", error);
  }
};

// Wrapper for broadcasting accident updates
const emitAccidentUpdate = async (updateData) => {
  try {
    // Retrieve the camera associated with this accident
    const camera = await Camera.findOne({ cameraId: updateData.cameraId }).populate("users");
    if (!camera) {
      console.error(`Camera with ID ${updateData.cameraId} not found`);
      return;
    }

    // Get list of user IDs linked to this camera
    const authorizedUserIds = camera.users.map(user => user.id); // Convert ObjectId to string

    // Broadcast only to authorized users
    Object.keys(clients).forEach((socketId) => {
      const socket = clients[socketId];
      if (socket.user && authorizedUserIds.includes(socket.user.id)) {
        socket.emit("accident_update", updateData);
      }
    });

    console.log(`Accident update dispatched to ${authorizedUserIds.length} users`);
  } catch (error) {
    console.error("Error emitting accident update:", error);
  }
};

module.exports = { emitNewAccident, emitAccidentUpdate };
