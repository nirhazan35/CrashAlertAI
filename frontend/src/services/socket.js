
import { io } from "socket.io-client";

let socket;
let forceLogoutCallback; // Store the callback for force logout

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

  socket.on("disconnect", (reason) => {
    console.log(`Disconnected from Socket.IO server. Reason: ${reason}`);
  });

  // Listen for force logout events
  socket.on("force_logout", (data) => {
    console.log("Forced logout detected:", data.message);
    if (forceLogoutCallback) {
      forceLogoutCallback(data.message);
    }
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket manually disconnected");
  }
};

// Register a callback for force logout events
export const onForceLogout = (callback) => {
  forceLogoutCallback = callback;

  // If socket already exists, register the handler immediately
  if (socket) {
    socket.off("force_logout"); // Remove any existing handler
    socket.on("force_logout", (data) => {
      callback(data.message);
    });
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

// Listen for notification updates
export const onNotification = (callback) => {
  if (!socket) throw new Error("Socket not initialized. Call connectSocket first.");
  socket.on("new_notification", (notification) => {
    callback(notification);
  });
};

