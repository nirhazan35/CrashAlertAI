const { clients } = require("../socket");
const Camera = require("../models/Camera");

// Helper function to log socket broadcasts
const logBroadcast = (eventType, userData, authorizedUserIds) => {
  console.log(`[Socket] Broadcasting ${eventType} to users:`, authorizedUserIds);
  console.log(`[Socket] Connected clients: ${Object.keys(clients).length}`);
  Object.keys(clients).forEach(socketId => {
    const socket = clients[socketId];
    console.log(`[Socket] Client ${socketId} - User: ${socket.user ? socket.user.id : 'not authenticated'}`);
  });
};

// Wrapper for broadcasting new accidents
const emitNewAccident = async (accidentData) => {
  try {
    // Get the camera object using cameraId from the accident
    const camera = await Camera.findOne({ cameraId: accidentData.cameraId }).populate("users");

    if (!camera) {
      console.error(`No users are associated with camera ID ${accidentData.cameraId}`);
      return;
    }

    // Get the list of user IDs associated with the camera
    const authorizedUserIds = camera.users.map(user => user.id); // Convert ObjectId to string
    
    logBroadcast('new_accident', accidentData, authorizedUserIds);

    // Broadcast to all sockets where socket.user.id is in authorizedUserIds
    let broadcastCount = 0;
    Object.keys(clients).forEach((socketId) => {
      const socket = clients[socketId];
      if (socket && socket.user && authorizedUserIds.includes(socket.user.id)) {
        socket.emit("new_accident", accidentData);
        console.log(`Accident dispatched to ${socket.user.username}`);
        broadcastCount++;
      }
    });

    console.log(`Accident dispatched to ${broadcastCount} of ${authorizedUserIds.length} authorized users`);
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
      console.error(`No users are associated with camera ID ${updateData.cameraId}`);
      return;
    }

    // Get list of user IDs linked to this camera
    const authorizedUserIds = camera.users.map(user => user.id); // Convert ObjectId to string
    
    logBroadcast('accident_update', updateData, authorizedUserIds);

    // Broadcast only to authorized users
    let broadcastCount = 0;
    Object.keys(clients).forEach((socketId) => {
      const socket = clients[socketId];
      if (socket && socket.user && authorizedUserIds.includes(socket.user.id)) {
        socket.emit("accident_update", updateData);
        broadcastCount++;
      }
    });

    console.log(`Accident update dispatched to ${broadcastCount} of ${authorizedUserIds.length} authorized users`);
  } catch (error) {
    console.error("Error emitting accident update:", error);
  }
};

const emitNotification = async (notification) => {
  try {
    // Broadcast to all sockets where socket.user.role is an admin
    let broadcastCount = 0;
    Object.keys(clients).forEach((socketId) => {
      const socket = clients[socketId];
      if (socket && socket.user && socket.user.role === 'admin') {
        socket.emit("new_notification", notification);
        console.log(`Notification dispatched to ${socket.user.username}`);
        broadcastCount++;
      }
    });
    console.log(`Notification dispatched to ${broadcastCount} admin users`);
  } catch (error) {
    console.error("Error emitting new accident:", error);
  }
};

module.exports = { emitNewAccident, emitAccidentUpdate, emitNotification };
