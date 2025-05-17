const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');
const { mockTransporter } = require('./mocks/nodemailer');

let mongod;
let httpServer;
let io;
let clientSocket;

// Set test environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.INTERNAL_SECRET = 'test-internal-secret';
process.env.NODE_ENV = 'test';

// Email configuration for tests
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_SECURE = 'false';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'test-password';
process.env.SMTP_FROM = 'test@test.com';

// Test data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    _id: new mongoose.Types.ObjectId()
};

const testAdmin = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    _id: new mongoose.Types.ObjectId()
};

const testCamera = {
    cameraId: 'CAM001',
    location: 'Test Location',
    status: 'active',
    _id: new mongoose.Types.ObjectId()
};

const testAuthLog = {
    userId: testUser._id,
    email: testUser.email,
    action: 'login',
    status: 'success',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    timestamp: new Date()
};

// Date formatting utilities
const formatDate = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const parseDate = (dateStr) => {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    return new Date(year, month - 1, day, hours, minutes);
};

// Generate valid JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Connect to the in-memory database before running tests
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // Setup socket.io server
    httpServer = require('http').createServer();
    io = new Server(httpServer);
    await new Promise((resolve) => httpServer.listen(() => resolve()));
    const port = httpServer.address().port;
    clientSocket = new Client(`http://localhost:${port}`);
});

// Clear all test data after each test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
    jest.clearAllMocks();
});

// Close database connection after all tests
afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
    await new Promise((resolve) => {
        if (clientSocket) clientSocket.close();
        if (httpServer) httpServer.close(resolve);
    });
});

// Export test data and utilities
global.testUser = testUser;
global.testAdmin = testAdmin;
global.testCamera = testCamera;
global.testAuthLog = testAuthLog;
global.mockTransporter = mockTransporter;
global.formatDate = formatDate;
global.parseDate = parseDate;
global.generateToken = generateToken;
global.io = io;
global.clientSocket = clientSocket;

// Generate and export valid tokens
global.mockToken = generateToken(testUser);
global.mockAdminToken = generateToken(testAdmin);
global.mockUser = testUser;
global.mockAdmin = testAdmin; 