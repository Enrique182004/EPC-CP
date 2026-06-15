const nodemailer = require("nodemailer");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

async function sendMail({ to, subject, html, text }) {
  if (!process.env.SMTP_USER) {
    console.log(`[MAIL] Would send to ${to}: ${subject}`);
    return { messageId: "dev-mode-no-send" };
  }
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
}

module.exports = { sendMail };
