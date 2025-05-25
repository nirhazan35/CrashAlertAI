const request = require('supertest');
const app = require('../mocks/app');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

describe('Users Routes', () => {
    beforeEach(async () => {
        // Create test users with hashed passwords
        const hashedUserPassword = await bcrypt.hash(global.testUser.password, 10);
        const hashedAdminPassword = await bcrypt.hash(global.testAdmin.password, 10);
        
        await User.create({
            ...global.testUser,
            password: hashedUserPassword
        });
        
        await User.create({
            ...global.testAdmin,
            password: hashedAdminPassword
        });
    });

    describe('GET /api/users/get-role', () => {
        it('should return user role when authenticated', async () => {
            const response = await request(app)
                .get('/api/users/get-role')
                .set('Authorization', `Bearer ${global.mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('role', global.testUser.role);
        });

        it('should return 401 when not authenticated', async () => {
            const response = await request(app)
                .get('/api/users/get-role');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'No token provided');
        });
    });

    describe('GET /api/users/get-all-users', () => {
        it('should return all users when admin is authenticated', async () => {
            const response = await request(app)
                .get('/api/users/get-all-users')
                .set('Authorization', `Bearer ${global.mockAdminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2); // testUser and testAdmin
        });

        it('should return 403 when non-admin tries to access', async () => {
            const response = await request(app)
                .get('/api/users/get-all-users')
                .set('Authorization', `Bearer ${global.mockToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Insufficient permissions');
        });
    });

    describe('POST /api/users/get-assigned-cameras', () => {
        it('should return assigned cameras when admin is authenticated', async () => {
            const response = await request(app)
                .post('/api/users/get-assigned-cameras')
                .set('Authorization', `Bearer ${global.mockAdminToken}`)
                .send({ userId: global.testUser._id });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return 403 when non-admin tries to access', async () => {
            const response = await request(app)
                .post('/api/users/get-assigned-cameras')
                .set('Authorization', `Bearer ${global.mockToken}`)
                .send({ userId: global.testUser._id });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Insufficient permissions');
        });
    });

    describe('POST /api/users/request-password-change', () => {
        it('should handle password change request', async () => {
            const response = await request(app)
                .post('/api/users/request-password-change')
                .send({ email: global.testUser.email });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Password change request sent');
        });

        it('should handle non-existent email', async () => {
            const response = await request(app)
                .post('/api/users/request-password-change')
                .send({ email: 'nonexistent@example.com' });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User not found');
        });
    });

    describe('POST /api/users/change-password', () => {
        it('should change password when admin is authenticated', async () => {
            const response = await request(app)
                .post('/api/users/change-password')
                .set('Authorization', `Bearer ${global.mockAdminToken}`)
                .send({
                    userId: global.testUser._id,
                    newPassword: 'newpassword123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Password changed successfully');
        });

        it('should return 403 when non-admin tries to change password', async () => {
            const response = await request(app)
                .post('/api/users/change-password')
                .set('Authorization', `Bearer ${global.mockToken}`)
                .send({
                    userId: global.testUser._id,
                    newPassword: 'newpassword123'
                });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Insufficient permissions');
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete user when admin is authenticated', async () => {
            const response = await request(app)
                .delete(`/api/users/${global.testUser._id}`)
                .set('Authorization', `Bearer ${global.mockAdminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User deleted successfully');
        });

        it('should return 403 when non-admin tries to delete user', async () => {
            const response = await request(app)
                .delete(`/api/users/${global.testUser._id}`)
                .set('Authorization', `Bearer ${global.mockToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Insufficient permissions');
        });
    });
}); 