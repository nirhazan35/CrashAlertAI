const express = require('express');
const cors = require('cors');
const connectDB = require('./src/db');
const cookieParser = require('cookie-parser');
const { startFakeAccidentSimulation } = require("./services/MLmodel");
const http = require("http");
const { initSocket } = require("./socket");
require('dotenv').config();

const app = express();
const port = 3001;
// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({
  origin: process.env.REACT_APP_URL_FRONTEND,
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'], 
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.use('/accidents', require('./routes/accidents'));
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.send('CrashAlertAI Backend is running!');
});

// startFakeAccidentSimulation();

// Start server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
