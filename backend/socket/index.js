const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io; // Exported for use in other files

// Initialize Socket.IO
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.REACT_APP_URL_FRONTEND,
      credentials: true,
    },
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = decoded; // Attach user data to socket
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Define connection event
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

// Function to broadcast new accidents
const broadcastNewAccident = (accidentData) => {
  io.emit("new_accident", accidentData);
};

// Function to broadcast accident updates
const broadcastAccidentUpdate = (updateData) => {
  io.emit("accident_update", updateData);
};

module.exports = { initSocket, broadcastNewAccident, broadcastAccidentUpdate };
