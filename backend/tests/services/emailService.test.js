const { sendPasswordChangeEmail, sendAccidentNotification } = require('../../src/services/emailService');

describe('Email Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sendPasswordChangeEmail', () => {
        it('should send password change email successfully', async () => {
            const userData = {
                email: global.testUser.email,
                name: global.testUser.username
            };

            await sendPasswordChangeEmail(userData);

            expect(global.mockTransporter.sendMail).toHaveBeenCalledWith({
                from: process.env.SMTP_FROM,
                to: userData.email,
                subject: expect.stringContaining('Password Change'),
                html: expect.stringContaining(userData.name)
            });
        });

        it('should handle email sending failure', async () => {
            const userData = {
                email: global.testUser.email,
                name: global.testUser.username
            };

            global.mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

            await expect(sendPasswordChangeEmail(userData)).rejects.toThrow('SMTP error');
        });
    });

    describe('sendAccidentNotification', () => {
        it('should send accident notification email successfully', async () => {
            const userData = {
                email: global.testUser.email,
                name: global.testUser.username
            };

            const accidentData = {
                location: global.testCamera.location,
                timestamp: new Date(),
                cameraId: global.testCamera.cameraId
            };

            await sendAccidentNotification(userData, accidentData);

            expect(global.mockTransporter.sendMail).toHaveBeenCalledWith({
                from: process.env.SMTP_FROM,
                to: userData.email,
                subject: expect.stringContaining('Accident Alert'),
                html: expect.stringContaining(accidentData.location)
            });
        });

        it('should handle email sending failure', async () => {
            const userData = {
                email: global.testUser.email,
                name: global.testUser.username
            };

            const accidentData = {
                location: global.testCamera.location,
                timestamp: new Date(),
                cameraId: global.testCamera.cameraId
            };

            global.mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

            await expect(sendAccidentNotification(userData, accidentData)).rejects.toThrow('SMTP error');
        });
    });
}); 