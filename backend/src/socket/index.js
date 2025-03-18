const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io; // Exported for use in other files
const clients = {}

// Initialize Socket.IO
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.REACT_APP_URL_FRONTEND,
      credentials: true,
    },
  });
  return io;
};

// Function to disconnect a specific user
const disconnectUser = (userId) => {
  if (clients[userId]) {
    console.log(`Forcing disconnect for user ID: ${userId}`);
    clients[userId].close();
    delete clients[userId];
    return true;
  }
  return false;
};

const initUserSocket = () => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = decoded; // Attach user data to socket
      console.log(`User authenticated: ${socket.user.username}`);
      clients[socket.user.id] = socket
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Define connection event
  io.on("connection", (socket) => { 
    console.log(`User connected: ${socket.user.username}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
};

module.exports = { initSocket, clients, initUserSocket, disconnectUser };
