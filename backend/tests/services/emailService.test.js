jest.mock("nodemailer");

describe("Email Service", () => {
  const validEmailData = {
    to: "recipient@example.com",
    subject: "Test Email",
    text: "Plain text content",
    html: "<p>HTML content</p>"
  };

  let sendMailMock;
  let sendEmail;
  let nodemailer;

  beforeEach(() => {
    // Reset module cache so that our changes take effect
    jest.resetModules();

    // Re-import nodemailer and override createTransport explicitly
    nodemailer = require("nodemailer");
    sendMailMock = jest.fn();
    nodemailer.createTransport = jest.fn().mockReturnValue({
      sendMail: sendMailMock
    });

    // Set environment variables for the email service
    process.env.EMAIL_ADDRESS = "test@example.com";
    process.env.EMAIL_PASS = "testpass";
    process.env.EMAIL_USER = "test@example.com";

    // Re-import the email service after our mocks are set up
    sendEmail = require("../../services/emailService").sendEmail;
    
    // Spy on console.error to suppress logs during testing
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful Operations", () => {
    test("should send email with correct parameters and headers", async () => {
      // Simulate a successful email send
      sendMailMock.mockResolvedValue({ messageId: "123" });

      await expect(sendEmail(validEmailData)).resolves.toBeUndefined();

      expect(sendMailMock).toHaveBeenCalledWith({
        from: `"CrashAlertAI" <test@example.com>`,
        to: validEmailData.to,
        subject: validEmailData.subject,
        text: validEmailData.text,
        html: validEmailData.html,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-XSS-Protection": "1; mode=block",
          "X-Mailer": "CrashAlertAI"
        }
      });
    });

    test("should accept minimal valid email data", async () => {
      sendMailMock.mockResolvedValue(true);
      
      await expect(sendEmail({
        to: "minimal@example.com",
        subject: "Minimal",
        text: "Content"
      })).resolves.toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    test("should throw and log errors on SMTP failure", async () => {
      const error = new Error("SMTP connection failed");
      sendMailMock.mockRejectedValue(error);

      await expect(sendEmail(validEmailData))
        .rejects.toThrow("SMTP connection failed");
      
      expect(console.error).toHaveBeenCalledWith(
        "Error sending email:",
        expect.objectContaining({ message: "SMTP connection failed" })
      );
    });
  });

  describe("Input Validation", () => {
    test("should reject missing required fields", async () => {
      await expect(sendEmail({}))
        .rejects.toThrow("Missing required fields: to, subject, and text/html content");
    });

    test("should reject invalid recipient format", async () => {
      await expect(sendEmail({ ...validEmailData, to: "invalid-email" }))
        .rejects.toThrow("Invalid recipient email address");
    });

    test("should require either text or html content", async () => {
      await expect(sendEmail({
        to: validEmailData.to,
        subject: validEmailData.subject
      })).rejects.toThrow("Missing required fields: to, subject, and text/html content");
    });
  });

  describe("Security Features", () => {
    test("should sanitize HTML content", async () => {
      const maliciousData = {
        ...validEmailData,
        html: "<script>alert('XSS')</script><p>Content</p>"
      };

      sendMailMock.mockResolvedValue(true);
      await sendEmail(maliciousData);

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          html: "<p>Content</p>" // Expect sanitized HTML
        })
      );
    });

    test("should include security headers", async () => {
      sendMailMock.mockResolvedValue(true);
      await sendEmail(validEmailData);

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Content-Type-Options": "nosniff",
            "X-XSS-Protection": "1; mode=block"
          })
        })
      );
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty text content with valid HTML", async () => {
      sendMailMock.mockResolvedValue(true);
      
      await expect(sendEmail({
        to: validEmailData.to,
        subject: validEmailData.subject,
        html: validEmailData.html
      })).resolves.toBeUndefined();
    });

    test("should handle large subject lines", async () => {
      const longSubject = "A".repeat(998); // e.g., near a common maximum length
      sendMailMock.mockResolvedValue(true);

      await expect(sendEmail({
        ...validEmailData,
        subject: longSubject
      })).resolves.toBeUndefined();
    });
  });
});
