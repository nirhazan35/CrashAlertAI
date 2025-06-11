const { sendPasswordChangeEmail, sendAccidentNotification } = require('../../src/services/emailService');

describe('Email Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sendPasswordChangeEmail', () => {
        it('should send password change email successfully', async () => {
            const emailData = {
                to: global.testUser.email,
                subject: 'Password Reset Request',
                text: `A password reset request has been made for the user: ${global.testUser.username}`,
                html: `<p>A password reset request has been made for the user: ${global.testUser.username}</p>`
            };

            await sendPasswordChangeEmail(emailData);

            expect(global.mockTransporter.sendMail).toHaveBeenCalledWith({
                from: `"CrashAlertAI" <${process.env.EMAIL_ADDRESS}>`,
                to: emailData.to,
                subject: emailData.subject,
                text: emailData.text,
                html: emailData.html,
                headers: {
                    'X-Content-Type-Options': 'nosniff',
                    'X-XSS-Protection': '1; mode=block',
                    'X-Mailer': 'CrashAlertAI'
                }
            });
        });

        it('should handle email sending failure', async () => {
            const emailData = {
                to: global.testUser.email,
                subject: 'Password Reset Request',
                text: `A password reset request has been made for the user: ${global.testUser.username}`,
                html: `<p>A password reset request has been made for the user: ${global.testUser.username}</p>`
            };

            global.mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

            await expect(sendPasswordChangeEmail(emailData)).rejects.toThrow('SMTP error');
        });

        it('should validate required fields', async () => {
            const invalidEmailData = {
                to: global.testUser.email,
                subject: 'Password Reset Request'
                // Missing text and html
            };

            await expect(sendPasswordChangeEmail(invalidEmailData)).rejects.toThrow('Missing required fields: to, subject, and text/html content');
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
                from: `"CrashAlertAI" <${process.env.EMAIL_ADDRESS}>`,
                to: userData.email,
                subject: 'Accident Alert',
                html: expect.stringContaining(accidentData.location),
                headers: {
                    'X-Content-Type-Options': 'nosniff',
                    'X-XSS-Protection': '1; mode=block',
                    'X-Mailer': 'CrashAlertAI'
                }
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