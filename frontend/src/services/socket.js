import { io } from "socket.io-client";

let socket;

// Initialize Socket.IO connection
export const connectSocket = (token) => {
  // Disconnect any existing connection first
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  // Only connect if we have a valid token
  if (!token) {
    console.error("Cannot connect socket: No authentication token provided");
    return;
  }
  
  socket = io(process.env.REACT_APP_URL_BACKEND, {
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket.IO connection error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from Socket.IO server");
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket manually disconnected");
  }
};

// Helper to ensure socket is initialized
const ensureSocketInitialized = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call connectSocket first.");
  }
};

// Listen for new accidents
export const onNewAccident = (callback) => {
  ensureSocketInitialized();
  socket.on("new_accident", (data) => {
    callback(data);
  });
};

// Listen for accident updates
export const onAccidentUpdate = (callback) => {
  ensureSocketInitialized();
  socket.on("accident_update", (data) => {
    callback(data);
  });
};
