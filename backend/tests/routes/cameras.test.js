const request = require('supertest');
const app = require('../mocks/app');
const Camera = require('../../src/models/Camera');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

describe('Cameras Routes', () => {
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

        // Create test camera
        await Camera.create(global.testCamera);
    });

    describe('GET /api/cameras/get-cameras', () => {
        it('should return all cameras when authenticated', async () => {
            const response = await request(app)
                .get('/api/cameras/get-cameras')
                .set('Authorization', `Bearer ${global.mockToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0].cameraId).toBe(global.testCamera.cameraId);
        });

        it('should return 401 when not authenticated', async () => {
            const response = await request(app)
                .get('/api/cameras/get-cameras');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'No token provided');
        });
    });

    describe('GET /api/cameras/get-id_location', () => {
        it('should return camera locations when authenticated', async () => {
            const response = await request(app)
                .get('/api/cameras/get-id_location')
                .set('Authorization', `Bearer ${global.mockToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('cameraId', global.testCamera.cameraId);
            expect(response.body[0]).toHaveProperty('location', global.testCamera.location);
        });

        it('should return 401 when not authenticated', async () => {
            const response = await request(app)
                .get('/api/cameras/get-id_location');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'No token provided');
        });
    });

    describe('POST /api/cameras/assign-cameras', () => {
        it('should assign cameras when admin is authenticated', async () => {
            const response = await request(app)
                .post('/api/cameras/assign-cameras')
                .set('Authorization', `Bearer ${global.mockAdminToken}`)
                .send({
                    userId: global.testUser._id,
                    cameraIds: [global.testCamera._id]
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Cameras assigned successfully');
        });

        it('should return 403 when non-admin tries to assign cameras', async () => {
            const response = await request(app)
                .post('/api/cameras/assign-cameras')
                .set('Authorization', `Bearer ${global.mockToken}`)
                .send({
                    userId: global.testUser._id,
                    cameraIds: [global.testCamera._id]
                });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Insufficient permissions');
        });
    });

    describe('POST /api/cameras/add-new-camera', () => {
        it('should add new camera when admin is authenticated', async () => {
            const newCamera = {
                cameraId: 'CAM002',
                location: 'New Location',
                status: 'active'
            };

            const response = await request(app)
                .post('/api/cameras/add-new-camera')
                .set('Authorization', `Bearer ${global.mockAdminToken}`)
                .send(newCamera);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('cameraId', newCamera.cameraId);
            expect(response.body).toHaveProperty('location', newCamera.location);
        });

        it('should return 403 when non-admin tries to add camera', async () => {
            const newCamera = {
                cameraId: 'CAM002',
                location: 'New Location',
                status: 'active'
            };

            const response = await request(app)
                .post('/api/cameras/add-new-camera')
                .set('Authorization', `Bearer ${global.mockToken}`)
                .send(newCamera);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Insufficient permissions');
        });
    });
}); 