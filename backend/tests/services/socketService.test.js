const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');
const Camera = require('../../src/models/Camera');

// Mock Camera model
jest.mock('../../src/models/Camera', () => ({
    findOne: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis()  // Add populate mock that returns itself
    })
}));

// Mock socket clients
const mockClients = {};

// Mock socket module
jest.mock('../../src/socket', () => ({
    clients: mockClients
}));

const socketService = require('../../src/services/socketService');

jest.setTimeout(5000); // Reduce timeout to 5 seconds

describe('Socket Service', () => {
    let io, clientSocket, serverSocket;

    beforeAll((done) => {
        const httpServer = require('http').createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket = Client(`http://localhost:${port}`);
            io.on('connection', (socket) => {
                serverSocket = socket;
            });
            clientSocket.on('connect', done);
        });
    });

    afterAll((done) => {
        if (io) io.close();
        if (clientSocket) clientSocket.close();
        done();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Clear mock clients
        Object.keys(mockClients).forEach(key => delete mockClients[key]);
    });

    describe('emitNewAccident', () => {
        it('should emit new accident to authorized users', async () => {
            const accidentData = {
                cameraId: global.testCamera.cameraId,
                location: global.testCamera.location,
                timestamp: new Date()
            };

            // Mock camera with authorized users
            const mockCamera = {
                users: [
                    { id: global.testUser._id.toString() }
                ]
            };
            
            // Setup the mock to return the camera data after population
            Camera.findOne().populate.mockResolvedValue(mockCamera);

            // Add mock client
            const mockSocket = {
                user: { id: global.testUser._id.toString() },
                emit: jest.fn()
            };
            mockClients['socket1'] = mockSocket;

            await socketService.emitNewAccident(accidentData);

            expect(Camera.findOne).toHaveBeenCalledWith({ cameraId: accidentData.cameraId });
            expect(mockSocket.emit).toHaveBeenCalledWith('new_accident', accidentData);
        });

        it('should not emit if camera not found', async () => {
            const accidentData = {
                cameraId: 'nonexistent',
                location: 'Test Location',
                timestamp: new Date()
            };

            // For this test, we want to simulate no camera found
            Camera.findOne().populate.mockResolvedValue(null);

            await socketService.emitNewAccident(accidentData);

            expect(Camera.findOne).toHaveBeenCalledWith({ cameraId: accidentData.cameraId });
        });
    });

    describe('emitAccidentUpdate', () => {
        it('should emit accident update to authorized users', async () => {
            const updateData = {
                cameraId: global.testCamera.cameraId,
                location: global.testCamera.location,
                timestamp: new Date()
            };

            // Mock camera with authorized users
            const mockCamera = {
                users: [
                    { id: global.testUser._id.toString() }
                ]
            };
            
            // Setup the mock to return the camera data after population
            Camera.findOne().populate.mockResolvedValue(mockCamera);

            // Add mock client
            const mockSocket = {
                user: { id: global.testUser._id.toString() },
                emit: jest.fn()
            };
            mockClients['socket1'] = mockSocket;

            await socketService.emitAccidentUpdate(updateData);

            expect(Camera.findOne).toHaveBeenCalledWith({ cameraId: updateData.cameraId });
            expect(mockSocket.emit).toHaveBeenCalledWith('accident_update', updateData);
        });

        it('should not emit if camera not found', async () => {
            const updateData = {
                cameraId: 'nonexistent',
                location: 'Test Location',
                timestamp: new Date()
            };

            // For this test, we want to simulate no camera found
            Camera.findOne().populate.mockResolvedValue(null);

            await socketService.emitAccidentUpdate(updateData);

            expect(Camera.findOne).toHaveBeenCalledWith({ cameraId: updateData.cameraId });
        });
    });

    describe('emitNotification', () => {
        it('should emit notification to admin users', async () => {
            const notification = {
                type: 'test',
                message: 'Test notification'
            };

            // Add mock admin client
            const mockSocket = {
                user: { role: 'admin', username: 'admin' },
                emit: jest.fn()
            };
            mockClients['socket1'] = mockSocket;

            await socketService.emitNotification(notification);

            expect(mockSocket.emit).toHaveBeenCalledWith('new_notification', notification);
        });

        it('should not emit to non-admin users', async () => {
            const notification = {
                type: 'test',
                message: 'Test notification'
            };

            // Add mock non-admin client
            const mockSocket = {
                user: { role: 'user', username: 'user' },
                emit: jest.fn()
            };
            mockClients['socket1'] = mockSocket;

            await socketService.emitNotification(notification);

            expect(mockSocket.emit).not.toHaveBeenCalled();
        });
    });
});