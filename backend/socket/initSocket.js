const http = require('http');
const WebSocket = require('ws');
const { saveNewAccident } = require('../controllers/accidents');

const socket = (app) => {

    // Create HTTP Server
    const server = http.createServer(app);

    // Set up WebSocket server
    const wss = new WebSocket.Server({ server });

    // WebSocket connection handling
    wss.on('connection', (ws) => {
    console.log('New client connected via WebSocket');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
    });

    // Broadcast function for accident alerts
    const broadcastAccident = (accidentData) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(accidentData));
            }
        });
    };

    // Simulated real-time alert for accidents (replace this with ML model integration)
    setInterval(async () => {
      const fakeAccident = {
        cameraId: `accident_${Math.floor(Math.random() * 1000)}`,
        location: "Highway 1",
        date: new Date().toISOString(),
        severity: "high",
        video: "fake-video-url",
      };
      // Broadcast the fake accident to connected clients
      broadcastAccident(fakeAccident);
      // Save the fake accident using the saveNewAccident controller
      try {
        // Simulating the req and res objects for the controller
        const req = {
          body: fakeAccident,
        };
        const res = {
          status: (statusCode) => ({
            json: (data) => console.log('broadcast accident'),
          }),
        };
        await saveNewAccident(req, res);
      } catch (error) {
        console.error("Error saving fake accident:", error);
      }
    }, 10000); // Simulate every 10 seconds

    return server;
}





module.exports = { socket };