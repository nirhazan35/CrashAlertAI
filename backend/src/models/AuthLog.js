const mongoose = require('mongoose');

const authLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['login', 'logout', 'password_change', 'password_reset']
    },
    status: {
        type: String,
        required: true,
        enum: ['success', 'failure']
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuthLog', authLogSchema); 