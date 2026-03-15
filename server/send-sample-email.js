/**
 * One-off script to send a sample confirmation email.
 * Usage: node server/send-sample-email.js (from project root)
 * Set SMTP_* in .env for real delivery; otherwise the link is logged to console.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sendConfirmationEmail } = require('./services/email');

// Override in .env with SAMPLE_EMAIL_TO=your-other@email.com to test a different inbox
const toEmail = process.env.SAMPLE_EMAIL_TO || 'khacey.salvador@gmail.com';
const sampleUrl = (process.env.APP_URL || 'https://balhinbalay.com') + '/confirm-email?token=sample-token-123';
const userName = 'Khacey';

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message || 'Timed out')), ms)
    )
  ]);
}

async function main() {
  const mailbox = process.env.SMTP_USER; // e.g. noreply@balhinbalay.com
  console.log('Sending sample confirmation email to', toEmail, '...');
  try {
    const result = await withTimeout(
      sendConfirmationEmail(toEmail, sampleUrl, userName),
      50000,
      'SMTP connection timed out (check host/port/firewall).'
    );
    if (result.sent) {
      console.log('Email sent successfully to', toEmail);
      if (result.messageId) console.log('MessageId:', result.messageId);
      // Send a copy to your own mailbox so you can confirm in IONOS webmail Inbox
      if (mailbox && mailbox !== toEmail) {
        const copy = await sendConfirmationEmail(mailbox, sampleUrl, userName);
        if (copy.sent) console.log('Copy sent to', mailbox, '- check that mailbox Inbox in IONOS webmail.');
      }
      console.log('Check Inbox, Spam, and Promotions (Gmail). Search: "Confirm your BalhinBalay" or "balhinbalay.com".');
    } else {
      console.log('No SMTP configured. Link logged above (check server output).');
    }
  } catch (err) {
    console.error('Failed:', err.message);
    if (err.code) console.error('Code:', err.code);
    if (err.response) console.error('Server:', err.response);
    process.exit(1);
  }
}

main();
