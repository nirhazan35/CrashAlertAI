const AuthLog = require('../../src/models/AuthLog');

describe('Authentication Logging Utilities', () => {
    beforeEach(async () => {
        await AuthLog.deleteMany({});
    });

    describe('logAuthAttempt', () => {
        it('should log successful authentication attempt', async () => {
            const logData = {
                userId: global.testUser._id,
                action: 'login',
                status: 'success',
                ipAddress: '127.0.0.1',
                userAgent: 'test-agent'
            };

            const log = await AuthLog.create(logData);
            expect(log).toBeDefined();
            expect(log.userId.toString()).toBe(logData.userId.toString());
            expect(log.status).toBe('success');
            expect(log.action).toBe('login');
        });

        it('should log failed authentication attempt', async () => {
            const logData = {
                userId: global.testUser._id,
                action: 'login',
                status: 'failure',
                ipAddress: '127.0.0.1',
                userAgent: 'test-agent'
            };

            const log = await AuthLog.create(logData);
            expect(log).toBeDefined();
            expect(log.status).toBe('failure');
        });

        it('should validate action enum values', async () => {
            const logData = {
                userId: global.testUser._id,
                action: 'invalid_action',
                status: 'success',
                ipAddress: '127.0.0.1',
                userAgent: 'test-agent'
            };

            await expect(AuthLog.create(logData)).rejects.toThrow();
        });
    });

    describe('getAuthLogs', () => {
        beforeEach(async () => {
            // Create multiple test logs
            await AuthLog.create([
                {
                    userId: global.testUser._id,
                    action: 'login',
                    status: 'success',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test-agent'
                },
                {
                    userId: global.testUser._id,
                    action: 'login',
                    status: 'failure',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test-agent'
                },
                {
                    userId: global.testUser._id,
                    action: 'logout',
                    status: 'success',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test-agent'
                }
            ]);
        });

        it('should return all auth logs', async () => {
            const logs = await AuthLog.find({});
            expect(logs).toHaveLength(3);
        });

        it('should filter logs by success status', async () => {
            const logs = await AuthLog.find({ status: 'success' });
            expect(logs).toHaveLength(2);
            logs.forEach(log => {
                expect(log.status).toBe('success');
            });
        });

        it('should filter logs by userId', async () => {
            const logs = await AuthLog.find({ userId: global.testUser._id });
            expect(logs).toHaveLength(3);
            logs.forEach(log => {
                expect(log.userId.toString()).toBe(global.testUser._id.toString());
            });
        });

        it('should sort logs by timestamp in descending order', async () => {
            const logs = await AuthLog.find({})
                .sort({ timestamp: -1 });
            
            expect(logs).toHaveLength(3);
            for (let i = 0; i < logs.length - 1; i++) {
                expect(logs[i].timestamp.getTime()).toBeGreaterThanOrEqual(
                    logs[i + 1].timestamp.getTime()
                );
            }
        });
    });
}); 