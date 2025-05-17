const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');
const { initializeSocket } = require('../../src/socket');
const Accident = require('../../src/models/Accident');

jest.setTimeout(5000); // 

describe('Socket Functionality', () => {
    let io, clientSocket, serverSocket;
    let httpServer;

    beforeAll((done) => {
        httpServer = require('http').createServer();
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

    afterAll(() => {
        io.close();
        clientSocket.close();
        httpServer.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Accident Events', () => {
        it('should emit new accident to all clients', (done) => {
            const timestamp = new Date();
            const accidentData = {
                cameraId: 'CAM001',
                location: 'Test Location',
                timestamp: timestamp
            };

            clientSocket.on('newAccident', (data) => {
                // Compare the timestamp separately to handle string vs Date object
                expect(data.cameraId).toBe(accidentData.cameraId);
                expect(data.location).toBe(accidentData.location);
                expect(new Date(data.timestamp).getTime()).toBe(timestamp.getTime());
                done();
            });

            serverSocket.emit('newAccident', accidentData);
        });

        it('should emit accident status update to all clients', (done) => {
            const updateData = {
                accidentId: 'ACC001',
                status: 'resolved'
            };

            clientSocket.on('accidentUpdate', (data) => {
                expect(data).toMatchObject(updateData);
                done();
            });

            serverSocket.emit('accidentUpdate', updateData);
        });
    });

    describe('Camera Events', () => {
        it('should emit camera status update to all clients', (done) => {
            const updateData = {
                cameraId: 'CAM001',
                status: 'offline'
            };

            clientSocket.on('cameraStatus', (data) => {
                expect(data).toMatchObject(updateData);
                done();
            });

            serverSocket.emit('cameraStatus', updateData);
        });

        it('should emit camera assignment to specific user', (done) => {
            const assignmentData = {
                userId: 'USER001',
                cameraIds: ['CAM001', 'CAM002']
            };

            clientSocket.on('cameraAssignment', (data) => {
                expect(data).toMatchObject(assignmentData);
                done();
            });

            serverSocket.emit('cameraAssignment', assignmentData);
        });
    });

    describe('User Events', () => {
        it('should emit user status update to all clients', (done) => {
            const updateData = {
                userId: 'USER001',
                status: 'offline'
            };

            clientSocket.on('userStatus', (data) => {
                expect(data).toMatchObject(updateData);
                done();
            });

            serverSocket.emit('userStatus', updateData);
        });
    });

    describe('Error Handling', () => {
        it('should handle disconnection', (done) => {
            clientSocket.on('disconnect', (reason) => {
                expect(clientSocket.connected).toBe(false);
                done();
            });

            clientSocket.disconnect();
        });
        
        // Fixed connection error test
        it('should handle connection errors', (done) => {
            // Create a separate client that will experience connection errors
            const errorClient = Client(`http://localhost:9999`);
            
            errorClient.on('connect_error', (error) => {
                expect(error).toBeDefined();
                errorClient.close();
                done();
            });
        });
    });
});