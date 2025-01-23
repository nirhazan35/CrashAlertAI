import { io } from "socket.io-client";

let socket; // Declare the socket variable globally

// Initialize Socket.IO connection
export const connectSocket = (token) => {
  socket = io(process.env.REACT_APP_URL_BACKEND, {
    auth: { token }, // Pass token for authentication
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
