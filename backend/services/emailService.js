const nodemailer = require("nodemailer");

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Function to send an email
const sendEmail = async (data) => {
    console.log("Sending email...");
  try {
    const mail = {
        from: `"CrashAlertAI" <${process.env.EMAIL_USER}>`, // Sender address
      to : data.to,
      subject: data.subject,
      text : data.text,
      html : data.html, 
    };
    console.log(mail);

    // Send the email
    await transporter.sendMail(mail);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Throw error to handle it in calling functions
  }
};

module.exports = {
  sendEmail,
};
