// In socket/index.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const clients = {};

// Helper to track active users
const getActiveUsers = () => {
  const activeUsers = new Set();
  Object.values(clients).forEach(socket => {
    if (socket.user) {
      activeUsers.add(socket.user.id);
    }
  });
  return [...activeUsers];
};

// Initialize Socket.IO
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.REACT_APP_URL_FRONTEND,
      credentials: true,
    },
    // Add ping timeout and interval for better connection management
    pingTimeout: 20000,
    pingInterval: 10000
  });
  
  // Authentication middleware
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
      console.error("Socket authentication error:", err.message);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  // Define connection event
  io.on("connection", (socket) => {
    if (socket.user) {
      console.log(`User connected: ${socket.user.username} (ID: ${socket.user.id}, Socket: ${socket.id})`);
      
      // Store socket by socket.id, not user.id to allow multiple connections from same user
      clients[socket.id] = socket;
      
      // Debug connected clients
      console.log(`Connected clients: ${Object.keys(clients).length}`);
      console.log(`Active users: ${getActiveUsers().length}`);
      
      // Handle errors on this socket
      socket.on("error", (error) => {
        console.error(`Socket error for user ${socket.user.username}:`, error);
      });
      
      // Handle disconnection
      socket.on("disconnect", (reason) => {
        console.log(`User disconnected: ${socket.user.username} (ID: ${socket.user.id}, Socket: ${socket.id})`);
        console.log(`Disconnect reason: ${reason}`);
        
        // Clean up the socket from clients
        delete clients[socket.id];
        
        console.log(`Remaining clients: ${Object.keys(clients).length}`);
        console.log(`Remaining active users: ${getActiveUsers().length}`);
      });
    }
  });
  
  // Periodically check for dead connections (every 30 seconds)
  setInterval(() => {
    const initialCount = Object.keys(clients).length;
    
    // Check each socket and remove dead ones
    for (const socketId in clients) {
      const socket = clients[socketId];
      if (!socket.connected) {
        console.log(`Removing dead socket: ${socketId}`);
        delete clients[socketId];
      }
    }
    
    const removedCount = initialCount - Object.keys(clients).length;
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} dead socket connections`);
      console.log(`Active connections after cleanup: ${Object.keys(clients).length}`);
    }
  }, 30000);
  
  return io;
};

// Remove the separate initUserSocket function since it's now integrated

module.exports = { initSocket, clients, getActiveUsers };