const express = require('express');
const app = express();

app.use(express.json());

// Mock authentication middleware
const mockAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    if (token === 'invalid-token') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    if (token === global.mockAdminToken) {
        req.user = { ...global.testAdmin, role: 'admin' };
    } else {
        req.user = { ...global.testUser, role: 'user' };
    }
    next();
};

// Mock admin middleware
const mockAdminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
    if (req.body.email === global.testUser.email && req.body.password === global.testUser.password) {
        res.status(200).json({ token: global.mockToken, user: global.testUser });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    if (req.body.email === global.testUser.email) {
        res.status(400).json({ message: 'Email already exists' });
    } else {
        res.status(201).json({ token: global.mockToken, user: req.body });
    }
});

app.post('/api/auth/refresh-token', mockAuthMiddleware, (req, res) => {
    res.status(200).json({ token: global.mockToken });
});

app.post('/api/auth/logout', mockAuthMiddleware, (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/auth/authMe', mockAuthMiddleware, (req, res) => {
    res.status(200).json({ token: global.mockToken });
});

app.get('/api/auth/logs', mockAuthMiddleware, mockAdminMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            logs: [],
            pagination: {
                total: 0,
                pages: 1,
                page: 1,
                limit: 50
            }
        }
    });
});

// User routes
app.get('/api/users/get-role', mockAuthMiddleware, (req, res) => {
    res.status(200).json({ role: req.user.role });
});

app.get('/api/users/get-all-users', mockAuthMiddleware, mockAdminMiddleware, (req, res) => {
    res.status(200).json([global.testUser, global.testAdmin]);
});

app.post('/api/users/get-assigned-cameras', mockAuthMiddleware, mockAdminMiddleware, (req, res) => {
    res.status(200).json([]);
});

app.post('/api/users/request-password-change', (req, res) => {
    if (req.body.email === 'nonexistent@example.com') {
        res.status(404).json({ message: 'User not found' });
    } else {
        res.status(200).json({ message: 'Password change request sent' });
    }
});

app.post('/api/users/change-password', mockAuthMiddleware, mockAdminMiddleware, (req, res) => {
    res.status(200).json({ message: 'Password changed successfully' });
});

app.delete('/api/users/:id', mockAuthMiddleware, mockAdminMiddleware, (req, res) => {
    res.status(200).json({ message: 'User deleted successfully' });
});

// Camera routes
app.get('/api/cameras/get-cameras', mockAuthMiddleware, (req, res) => {
    res.status(200).json([global.testCamera]);
});

app.get('/api/cameras/get-id_location', mockAuthMiddleware, (req, res) => {
    res.status(200).json([{ cameraId: global.testCamera.cameraId, location: global.testCamera.location }]);
});

app.post('/api/cameras/assign-cameras', mockAuthMiddleware, mockAdminMiddleware, (req, res) => {
    res.status(200).json({ message: 'Cameras assigned successfully' });
});

app.post('/api/cameras/add-new-camera', mockAuthMiddleware, mockAdminMiddleware, (req, res) => {
    res.status(201).json(req.body);
});

module.exports = app; 