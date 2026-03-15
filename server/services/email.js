/**
 * Email service for sending confirmation emails.
 * Set SMTP_* env vars for production; otherwise links are logged to console (dev mode).
 */
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

function createTransporter(port, secure) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 12000,
    greetingTimeout: 8000,
    socketTimeout: 12000
  });
}

function getTransporter() {
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  return createTransporter(port, secure);
}

function isConnectionError(err) {
  const msg = (err && err.message || '').toLowerCase();
  const code = err && err.code;
  return (
    msg.includes('timeout') ||
    msg.includes('econnrefused') ||
    msg.includes('econnreset') ||
    msg.includes('enotfound') ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET'
  );
}

/**
 * Send confirmation email. Returns { sent: true } or { sent: false, previewUrl } (Ethereal) or logs to console (dev).
 */
async function sendConfirmationEmail(toEmail, confirmUrl, userName) {
  const appName = process.env.APP_NAME || 'BalhinBalay';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || `noreply@${process.env.SMTP_HOST || 'localhost'}`;
  const appUrlBase = (process.env.APP_URL || 'https://balhinbalay.com').replace(/\/$/, '');
  const tickImageUrl = `${appUrlBase}/tick.png`;
  const tickCid = 'bb-verify-tick';
  const tickCandidates = [
    path.join(__dirname, '..', '..', 'public', 'tick.png'),
    path.join(__dirname, '..', '..', 'tick.png'),
    path.join(__dirname, '..', '..', '..', 'tick.png')
  ];
  const tickImagePath = tickCandidates.find((p) => fs.existsSync(p));
  const tickSrc = tickImagePath ? `cid:${tickCid}` : tickImageUrl;
  const verificationHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 10px;">
<tr>
<td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;padding:40px;text-align:center;">
<tr>
<td>
<div style="margin-bottom:18px;">
<img src="${tickSrc}" alt="Verified" width="64" height="64" style="display:block;margin:0 auto;max-width:64px;height:auto;">
</div>
<h1 style="margin:0;font-size:28px;color:#111;">Please verify your email</h1>
<p style="color:#666;font-size:16px;margin-top:16px;line-height:1.6;">
To start using <strong>${appName}</strong>, please confirm your email address.
This helps us keep your account secure.
</p>
<div style="margin:30px 0;">
<a href="${confirmUrl}"
style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
Verify my account
</a>
</div>
<p style="font-size:14px;color:#888;line-height:1.6;">
If you did not create this account, you can safely ignore this email.
</p>
<hr style="margin:30px 0;border:none;border-top:1px solid #eee;">
<p style="font-size:13px;color:#aaa;line-height:1.6;">
You're receiving this email because you registered an account on ${appName}.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"${appName}" <${from}>`,
    to: toEmail,
    subject: `Confirm your ${appName} account`,
    text: `Hi${userName ? ` ${userName}` : ''},\n\nPlease confirm your email by clicking this link:\n\n${confirmUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't create an account, ignore this email.`,
    html: verificationHtml,
    attachments: tickImagePath
      ? [{ filename: 'tick.png', path: tickImagePath, cid: tickCid }]
      : undefined
  };

  let transporter = getTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const host = process.env.SMTP_HOST;
      if (isConnectionError(err) && port === 587) {
        console.error('First attempt (port 587) failed:', err.message, '- trying port 465 (SSL)...');
        const fallback = createTransporter(465, true);
        if (fallback) {
          try {
            const info = await fallback.sendMail(mailOptions);
            console.log('Sent via port 465 (SSL). Consider setting SMTP_PORT=465 and SMTP_SECURE=true in .env.');
            return { sent: true, messageId: info.messageId };
          } catch (err2) {
            console.error('Port 465 also failed:', err2.message);
          }
        }
      }
      console.error('Email send error:', err.message);
      if (err.code) console.error('Code:', err.code);
      if (host) console.error('SMTP target:', host + ':' + (process.env.SMTP_PORT || '587'), '(check host, port, firewall, and provider docs e.g. IONOS)');
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

/**
 * Send password reset email with 5-digit code.
 */
async function sendPasswordResetCode(toEmail, code, userName) {
  const appName = process.env.APP_NAME || 'BalhinBalay';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || `noreply@${process.env.SMTP_HOST || 'localhost'}`;
  const resetHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 10px;">
<tr>
<td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;padding:40px;text-align:center;">
<tr>
<td>
<h1 style="margin:0;font-size:28px;color:#111;">Reset your password</h1>
<p style="color:#666;font-size:16px;margin-top:16px;line-height:1.6;">
Use this code to reset your ${appName} password:
</p>
<div style="margin:24px 0;font-size:32px;font-weight:bold;letter-spacing:0.25em;color:#2563eb;">${String(code)}</div>
<p style="font-size:14px;color:#888;line-height:1.6;">
This code expires in 15 minutes. If you didn't request a reset, you can ignore this email.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
  `;
  const mailOptions = {
    from: `"${appName}" <${from}>`,
    to: toEmail,
    subject: `Reset your ${appName} password`,
    text: `Hi${userName ? ` ${userName}` : ''},\n\nYour password reset code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't request a reset, ignore this email.`,
    html: resetHtml
  };
  const transporter = getTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const host = process.env.SMTP_HOST;
      if (isConnectionError(err) && port === 587) {
        const fallback = createTransporter(465, true);
        if (fallback) {
          try {
            const info = await fallback.sendMail(mailOptions);
            return { sent: true, messageId: info.messageId };
          } catch (_) {}
        }
      }
      throw err;
    }
  }
  console.log('[Email] Password reset code (no SMTP):', code);
  return { sent: false, dev: true };
}

module.exports = { sendConfirmationEmail, sendMinimalTest, sendPasswordResetCode };
