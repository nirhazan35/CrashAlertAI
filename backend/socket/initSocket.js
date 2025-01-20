const http = require('http');
const WebSocket = require('ws');
const { saveAccident } = require('../controllers/accidents');

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
    setInterval(() => {
        const fakeAccident = {
            cameraId: `accident_${Math.floor(Math.random() * 1000)}`,
            location: "Highway 1",
            date: new Date().toISOString(),
            severity: "high",
            video: "fake-video-url",
        };
        console.log("Broadcasting fake accident:", fakeAccident);
        broadcastAccident(fakeAccident);
        saveAccident(fakeAccident);
        }, 10000); // Simulate every 15 seconds

    return server;
}





module.exports = { socket };