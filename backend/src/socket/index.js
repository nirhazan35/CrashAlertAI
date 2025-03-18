// In socket/index.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const clients = {};

// Initialize Socket.IO
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.REACT_APP_URL_FRONTEND,
      credentials: true,
    },
  });
  
  // Move authentication middleware here
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
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  // Define connection event
  io.on("connection", (socket) => {
    if (socket.user) {
      console.log(`User connected: ${socket.user.username}`);
      clients[socket.user.id] = socket;
      
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.username}`);
        delete clients[socket.user.id];
      });
    }
  });
  
  return io;
};

// Remove the separate initUserSocket function since it's now integrated

module.exports = { initSocket, clients };