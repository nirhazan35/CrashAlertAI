const http = require('http');
const WebSocket = require('ws');

let wss; // Declare wss globally to access it in broadcastAccident

const socket = (app) => {
  // Create HTTP Server
  const server = http.createServer(app);

  // Set up WebSocket server
  wss = new WebSocket.Server({ server });

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('New client connected via WebSocket');

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  
  return server;
};

// Broadcast function for accident alerts
const broadcastAccident = (accidentData) => {
  if (!wss) {
    console.error('WebSocket server is not initialized');
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(accidentData));
    }
  });
};

module.exports = { socket, broadcastAccident };
