// services/emailService.js
const nodemailer = require("nodemailer");
const sanitizeHtml = require("sanitize-html");

const validateEmail = (email) => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateInput = (data) => {
  if (!data.to || !data.subject || (!data.text && !data.html)) {
    throw new Error(
      "Missing required fields: to, subject, and text/html content"
    );
  }
  
  if (!validateEmail(data.to)) {
    throw new Error("Invalid recipient email address");
  }
};

const sanitizeContent = (data) => ({
  ...data,
  html: data.html ? sanitizeHtml(data.html) : undefined
});

const sendEmail = async (data) => {
  try {
    validateInput(data);
    const sanitizedData = sanitizeContent(data);

    const mail = {
      from: `"CrashAlertAI" <${process.env.EMAIL_USER}>`,
      to: sanitizedData.to,
      subject: sanitizedData.subject,
      text: sanitizedData.text,
      html: sanitizedData.html,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'X-Mailer': 'CrashAlertAI'
      }
    };

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail(mail);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };