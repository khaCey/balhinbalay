/**
 * Send one minimal plain-text email to your mailbox (SMTP_USER).
 * Use to confirm whether IONOS delivers anything: subject "SMTP test", body "If you see this, SMTP delivery works."
 * Run: node server/send-minimal-test.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sendMinimalTest } = require('./services/email');

const to = process.env.SMTP_USER;
if (!to) {
  console.error('Set SMTP_USER in .env');
  process.exit(1);
}

async function main() {
  console.log('Sending minimal test to', to, '...');
  try {
    const result = await sendMinimalTest(to);
    if (result.sent) {
      console.log('Sent. MessageId:', result.messageId);
      console.log('Check Inbox (and Spam) for subject "SMTP test". If it’s not there, IONOS is not delivering — contact IONOS with this MessageId.');
    } else {
      console.log('No SMTP configured.');
    }
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

main();
