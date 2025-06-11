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
      from: `"CrashAlertAI" <${process.env.EMAIL_ADDRESS}>`,
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

/**
 * Send a password change notification email
 * @param {Object} emailData - Email data containing to, subject, text, html
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendPasswordChangeEmail = async (emailData) => {
    try {
        validateInput(emailData);
        const sanitizedData = sanitizeContent(emailData);

        const mail = {
            from: `"CrashAlertAI" <${process.env.EMAIL_ADDRESS}>`,
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
        console.error("Error sending password change email:", error);
        throw error;
    }
};

/**
 * Send an accident notification email
 * @param {Object} userData - User data containing email and name
 * @param {Object} accidentData - Accident data containing location and timestamp
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendAccidentNotification = async (userData, accidentData) => {
    try {
        const mailOptions = {
            from: `"CrashAlertAI" <${process.env.EMAIL_ADDRESS}>`,
            to: userData.email,
            subject: 'Accident Alert',
            html: `
                <h1>Accident Alert</h1>
                <p>Hello ${userData.name},</p>
                <p>An accident has been detected at ${accidentData.location}.</p>
                <p>Time: ${accidentData.timestamp}</p>
                <p>Please take necessary action.</p>
            `,
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

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending accident notification email:", error);
        throw error;
    }
};

module.exports = {
    sendPasswordChangeEmail,
    sendAccidentNotification
};