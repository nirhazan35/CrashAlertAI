const request = require('supertest');
const express = require('express');
const Accident = require('../../src/models/Accident');

// Create mock app
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockInternalSecretMiddleware = (req, res, next) => {
    const secret = req.headers['x-internal-secret'];
    if (secret === process.env.INTERNAL_SECRET) {
        next();
    } else {
        res.status(403).json({ message: 'Unauthorized' });
    }
};

// Mock accident routes
app.post('/api/accidents/internal-new-accident', mockInternalSecretMiddleware, async (req, res) => {
    try {
        const { cameraId, location, date, severity, video, status, falsePositive } = req.body;

        // Validate required fields
        if (!cameraId || !location || !severity) {
            return res.status(400).json({
                success: false,
                message: "cameraId, location, and severity are required."
            });
        }

        // Create a new Accident document
        const newAccident = new Accident({
            cameraId,
            location,
            date: date || new Date(),
            severity,
            video,
            status: status || 'active',
            falsePositive: falsePositive || false
        });

        // Save the accident
        const savedAccident = await newAccident.save();
        return res.status(201).json({
            success: true,
            message: "New accident saved successfully.",
            data: savedAccident
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while saving the accident.",
            error: error.message
        });
    }
});

describe('Internal New Accident Route', () => {
    beforeEach(async () => {
        // Clear the Accident collection before each test
        await Accident.deleteMany({});
    });

    it('should create a new accident with valid data and correct internal secret', async () => {
        const accidentData = {
            cameraId: global.testCamera.cameraId,
            location: global.testCamera.location,
            severity: 'high',
            video: 'test-video-url',
            status: 'active',
            falsePositive: false
        };

        const response = await request(app)
            .post('/api/accidents/internal-new-accident')
            .set('x-internal-secret', process.env.INTERNAL_SECRET)
            .send(accidentData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
            cameraId: accidentData.cameraId,
            location: accidentData.location,
            severity: accidentData.severity,
            status: accidentData.status,
            falsePositive: accidentData.falsePositive
        });
    });

    it('should return 400 when required fields are missing', async () => {
        const invalidData = {
            cameraId: global.testCamera.cameraId
            // Missing location and severity
        };

        const response = await request(app)
            .post('/api/accidents/internal-new-accident')
            .set('x-internal-secret', process.env.INTERNAL_SECRET)
            .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('required');
    });

    it('should return 403 when internal secret is incorrect', async () => {
        const accidentData = {
            cameraId: global.testCamera.cameraId,
            location: global.testCamera.location,
            severity: 'high'
        };

        const response = await request(app)
            .post('/api/accidents/internal-new-accident')
            .set('x-internal-secret', 'wrong-secret')
            .send(accidentData);

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should use default values for optional fields', async () => {
        const minimalData = {
            cameraId: global.testCamera.cameraId,
            location: global.testCamera.location,
            severity: 'high'
        };

        const response = await request(app)
            .post('/api/accidents/internal-new-accident')
            .set('x-internal-secret', process.env.INTERNAL_SECRET)
            .send(minimalData);

        expect(response.status).toBe(201);
        expect(response.body.data).toMatchObject({
            ...minimalData,
            status: 'active',
            falsePositive: false
        });
    });
}); 