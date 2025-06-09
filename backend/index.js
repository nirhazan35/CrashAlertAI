require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/util/db');
const cookieParser = require('cookie-parser');
const { startFakeAccidentSimulation } = require("./src/services/MLmodel");
const http = require("http");
const { initSocket } = require("./src/socket");
const ipProcessor = require('./src/middleware/ipProcessor');

const app = express();
const port = 3001;

// Trust proxy for proper IP extraction
app.set('trust proxy', true);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost', 'http://localhost:8080', process.env.REACT_APP_URL_FRONTEND],
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'], 
}));
app.use(express.json());
app.use(cookieParser());
app.use(ipProcessor); // IP processing middleware

// Connect to MongoDB
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Routes
app.use('/accidents', require('./src/routes/accidents'));
app.use('/users', require('./src/routes/users'));
app.use('/cameras', require('./src/routes/cameras'));
app.use('/auth', require('./src/routes/auth'));

app.get('/', (req, res) => {
  res.send('CrashAlertAI Backend is running!');
});

app.get('/health', (req, res) => {
  res.send('OK');
});

// startFakeAccidentSimulation('active');

// Start server
if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}
module.exports = app;