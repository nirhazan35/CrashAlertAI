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

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send a password change notification email
 * @param {Object} userData - User data containing email and name
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendPasswordChangeEmail = async (userData) => {
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: userData.email,
        subject: 'Password Change Notification',
        html: `
            <h1>Password Change Notification</h1>
            <p>Hello ${userData.name},</p>
            <p>Your password has been changed successfully.</p>
            <p>If you did not make this change, please contact support immediately.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

/**
 * Send an accident notification email
 * @param {Object} userData - User data containing email and name
 * @param {Object} accidentData - Accident data containing location and timestamp
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendAccidentNotification = async (userData, accidentData) => {
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: userData.email,
        subject: 'Accident Alert',
        html: `
            <h1>Accident Alert</h1>
            <p>Hello ${userData.name},</p>
            <p>An accident has been detected at ${accidentData.location}.</p>
            <p>Time: ${accidentData.timestamp}</p>
            <p>Please take necessary action.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendPasswordChangeEmail,
    sendAccidentNotification
};