/**
 * Email service for sending confirmation emails.
 * Set SMTP_* env vars for production; otherwise links are logged to console (dev mode).
 */
const nodemailer = require('nodemailer');

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 5000
    });
  }
  return null;
}

/**
 * Send confirmation email. Returns { sent: true } or { sent: false, previewUrl } (Ethereal) or logs to console (dev).
 */
async function sendConfirmationEmail(toEmail, confirmUrl, userName) {
  const appName = process.env.APP_NAME || 'BalhinBalay';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || `noreply@${process.env.SMTP_HOST || 'localhost'}`;

  const mailOptions = {
    from: `"${appName}" <${from}>`,
    to: toEmail,
    subject: `Confirm your ${appName} account`,
    text: `Hi${userName ? ` ${userName}` : ''},\n\nPlease confirm your email by clicking this link:\n\n${confirmUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't create an account, ignore this email.`,
    html: `
      <p>Hi${userName ? ` ${userName}` : ''},</p>
      <p>Please confirm your email by clicking the link below:</p>
      <p><a href="${confirmUrl}" style="color:#0d7377;font-weight:600">Confirm my account</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>— ${appName}</p>
    `
  };

  const transporter = getTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      console.error('Email send error:', err.message);
      throw err;
    }
  }

  // Dev: log the link so developers can test
  console.log('[Email] Confirmation link (no SMTP configured):', confirmUrl);
  return { sent: false, dev: true };
}

/**
 * Send a minimal plain-text email (no HTML, no link). Use to test if IONOS delivers at all.
 */
async function sendMinimalTest(toEmail) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false };
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const info = await transporter.sendMail({
    from: `"BalhinBalay" <${from}>`,
    to: toEmail,
    subject: 'SMTP test',
    text: 'If you see this, SMTP delivery works.'
  });
  return { sent: true, messageId: info.messageId };
}

module.exports = { sendConfirmationEmail, sendMinimalTest };
