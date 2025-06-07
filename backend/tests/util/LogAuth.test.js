const AuthLogs = require('../../src/models/AuthLogs');

describe('Authentication Logging Utilities', () => {
    beforeEach(async () => {
        await AuthLogs.deleteMany({});
    });

    describe('logAuthAttempt', () => {
        it('should log successful authentication attempt', async () => {
            const log = await AuthLogs.logSuccess('testuser', 'Login');
            
            expect(log).toBeDefined();
            expect(log.username).toBe('testuser');
            expect(log.result).toBe('Success');
            expect(log.type).toBe('Login');
            expect(log.displayDate).toBeDefined();
            expect(log.displayTime).toBeDefined();
        });

        it('should log failed authentication attempt', async () => {
            const log = await AuthLogs.logFailure('testuser', 'Login', null, 'Invalid credentials');
            
            expect(log).toBeDefined();
            expect(log.username).toBe('testuser');
            expect(log.result).toBe('Failure');
            expect(log.type).toBe('Login');
            expect(log.errorMessage).toBe('Invalid credentials');
        });

        it('should validate type enum values', async () => {
            const logData = {
                username: 'testuser',
                type: 'invalid_type',
                result: 'Success'
            };

            await expect(AuthLogs.create(logData)).rejects.toThrow();
        });

        it('should validate result enum values', async () => {
            const logData = {
                username: 'testuser',
                type: 'Login',
                result: 'invalid_result'
            };

            await expect(AuthLogs.create(logData)).rejects.toThrow();
        });
    });

    describe('getAuthLogs', () => {
        beforeEach(async () => {
            // Create multiple test logs
            await AuthLogs.logSuccess('testuser1', 'Login');
            await AuthLogs.logFailure('testuser1', 'Login', null, 'Wrong password');
            await AuthLogs.logSuccess('testuser1', 'Logout');
            await AuthLogs.logSuccess('testuser2', 'Register');
        });

        it('should return all auth logs', async () => {
            const logs = await AuthLogs.find({});
            expect(logs).toHaveLength(4);
        });

        it('should filter logs by success result', async () => {
            const logs = await AuthLogs.find({ result: 'Success' });
            expect(logs).toHaveLength(3);
            logs.forEach(log => {
                expect(log.result).toBe('Success');
            });
        });

        it('should filter logs by failure result', async () => {
            const logs = await AuthLogs.find({ result: 'Failure' });
            expect(logs).toHaveLength(1);
            expect(logs[0].errorMessage).toBe('Wrong password');
        });

        it('should filter logs by username', async () => {
            const logs = await AuthLogs.find({ username: 'testuser1' });
            expect(logs).toHaveLength(3);
            logs.forEach(log => {
                expect(log.username).toBe('testuser1');
            });
        });

        it('should filter logs by type', async () => {
            const loginLogs = await AuthLogs.find({ type: 'Login' });
            expect(loginLogs).toHaveLength(2);
            
            const registerLogs = await AuthLogs.find({ type: 'Register' });
            expect(registerLogs).toHaveLength(1);
        });

        it('should sort logs by timestamp in descending order', async () => {
            const logs = await AuthLogs.find({})
                .sort({ timeStamp: -1 });
            
            expect(logs).toHaveLength(4);
            for (let i = 0; i < logs.length - 1; i++) {
                expect(logs[i].timeStamp.getTime()).toBeGreaterThanOrEqual(
                    logs[i + 1].timeStamp.getTime()
                );
            }
        });
    });

    describe('AuthLogs methods', () => {
        it('should initialize and save log with request info', async () => {
            const mockReq = {
                ip: '192.168.1.1',
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            };

            const log = new AuthLogs();
            await log.initializeAndSave('testuser', 'Login', mockReq, 'Success');

            expect(log.username).toBe('testuser');
            expect(log.type).toBe('Login');
            expect(log.result).toBe('Success');
            expect(log.ipAddress).toBe('192.168.1.1');
            expect(log.browser).toBe('Chrome');
            expect(log.operatingSystem).toBe('Windows');
        });

        it('should update result with error message', async () => {
            const log = await AuthLogs.logSuccess('testuser', 'Login');
            await log.updateResult('Failure', 'Session expired');

            expect(log.result).toBe('Failure');
            expect(log.errorMessage).toBe('Session expired');
        });
    });
}); 