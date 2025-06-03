const mockTransporter = {
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
};

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue(mockTransporter)
}));

module.exports = { mockTransporter }; 