const jwt = require('jsonwebtoken');
const { verifyToken, hasPermission, verifyInternalSecret } = require('../../src/middleware/auth');
const User = require('../../src/models/User');

// Mock User model
jest.mock('../../src/models/User', () => ({
    findById: jest.fn()
}));

// Mock environment variables
process.env.ACCESS_TOKEN_SECRET = 'test-secret';
process.env.INTERNAL_SECRET = 'test-internal-secret';

describe('Auth Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {},
            user: null
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('verifyToken', () => {
        it('should pass with valid token', () => {
            const token = jwt.sign(
                { id: global.testUser._id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' }
            );
            mockReq.headers.authorization = `Bearer ${token}`;

            verifyToken(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).toBeDefined();
            expect(mockReq.user.id).toBe(global.testUser._id.toString());
        });

        it('should return 401 with invalid token', () => {
            mockReq.headers.authorization = 'Bearer invalid-token';

            verifyToken(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid or expired Access Token',
                error: expect.any(String)
            });
        });

        it('should return 401 without token', () => {
            verifyToken(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Unauthorized'
            });
        });
    });

    describe('hasPermission', () => {
        it('should pass with correct permission', async () => {
            mockReq.user = { id: global.testUser._id };
            User.findById.mockResolvedValue({ get: () => 'admin' });

            await hasPermission(['admin'])(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should return 403 with incorrect permission', async () => {
            mockReq.user = { id: global.testUser._id };
            User.findById.mockResolvedValue({ get: () => 'user' });

            await hasPermission(['admin'])(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Access denied'
            });
        });

        it('should return 400 when role not found', async () => {
            mockReq.user = { id: global.testUser._id };
            User.findById.mockResolvedValue({ get: () => null });

            await hasPermission(['admin'])(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Role not found for user'
            });
        });
    });

    describe('verifyInternalSecret', () => {
        it('should pass with correct internal secret', () => {
            mockReq.headers['x-internal-secret'] = process.env.INTERNAL_SECRET;

            verifyInternalSecret(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should return 403 with incorrect internal secret', () => {
            mockReq.headers['x-internal-secret'] = 'wrong-secret';

            verifyInternalSecret(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Unauthorized'
            });
        });

        it('should return 403 without internal secret', () => {
            verifyInternalSecret(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Unauthorized'
            });
        });
    });
}); 