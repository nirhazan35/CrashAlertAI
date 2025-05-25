const request = require('supertest');
const app = require('../mocks/app');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

describe('Auth Routes', () => {
    beforeEach(async () => {
        // Create test user with hashed password
        const hashedPassword = await bcrypt.hash(global.testUser.password, 10);
        await User.create({
            ...global.testUser,
            password: hashedPassword
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: global.testUser.email,
                    password: global.testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(global.testUser.email);
        });

        it('should return 401 with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: global.testUser.email,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid credentials');
        });
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const newUser = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(newUser.email);
        });

        it('should return 400 with existing email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(global.testUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Email already exists');
        });
    });

    describe('POST /api/auth/refresh-token', () => {
        it('should refresh token with valid token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .set('Authorization', `Bearer ${global.mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        it('should return 401 with invalid token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid token');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${global.mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Logged out successfully');
        });

        it('should return 401 without token', async () => {
            const response = await request(app)
                .post('/api/auth/logout');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'No token provided');
        });
    });

    describe('GET /api/auth/authMe', () => {
        it('should refresh token successfully', async () => {
            const response = await request(app)
                .get('/api/auth/authMe')
                .set('Authorization', `Bearer ${global.mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });
    });

    describe('GET /api/auth/logs', () => {
        it('should return auth logs when admin is authenticated', async () => {
            const response = await request(app)
                .get('/api/auth/logs')
                .set('Authorization', `Bearer ${global.mockAdminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('logs');
            expect(response.body.data).toHaveProperty('pagination');
        });

        it('should return 403 when non-admin tries to access logs', async () => {
            const response = await request(app)
                .get('/api/auth/logs')
                .set('Authorization', `Bearer ${global.mockToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Insufficient permissions');
        });

        it('should return 401 when no token is provided', async () => {
            const response = await request(app)
                .get('/api/auth/logs');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'No token provided');
        });
    });
}); 