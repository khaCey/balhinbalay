/**
 * Push notifications (FCM for Android). Optional: set GOOGLE_APPLICATION_CREDENTIALS
 * to the path of your Firebase service account JSON to enable.
 * sendPushToUser(pool, userId, { title, body, data }) sends to all tokens for that user.
 */
/** undefined = not yet tried, null = init failed, object = FCM messaging instance */
let messaging = undefined;
let lastPushError = null;

function getMessaging() {
  const path = require('path');
  const fs = require('fs');
  const rawPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FCM_SERVICE_ACCOUNT_PATH;
  const credPath = rawPath && String(rawPath).trim();
  const projectRoot = path.join(__dirname, '..', '..');
  const fullPath = credPath ? (path.isAbsolute(credPath) ? credPath : path.join(projectRoot, credPath)) : '';
  const exists = fullPath ? fs.existsSync(fullPath) : false;
  if (messaging !== undefined) {
    if (messaging === null) {
      console.log('[push] FCM disabled (cached). credPath', credPath ? 'set' : 'NOT SET', '| fullPath', fullPath, '| exists', exists);
      if (lastPushError) console.log('[push] last init error:', lastPushError);
    }
    return messaging;
  }
  console.log('[push] getMessaging: credPath', credPath ? 'set' : 'NOT SET', '| fullPath', fullPath, '| exists', exists);
  if (!credPath) {
    console.warn('[push] GOOGLE_APPLICATION_CREDENTIALS not set in .env (server reads .env from project root)');
    lastPushError = 'credPath not set';
    messaging = null;
    return null;
  }
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      if (!exists) {
        console.error('[push] File not found:', fullPath);
        lastPushError = 'File not found: ' + fullPath;
        messaging = null;
        return null;
      }
      const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    messaging = admin.messaging();
  } catch (err) {
    lastPushError = err.message || String(err);
    console.log('[push] init failed:', lastPushError);
    if (err.stack) console.error('[push]', err.stack);
    messaging = null;
  }
  return messaging;
}

/**
 * Send push to all tokens for a user. Removes tokens that fail (invalid/unregistered).
 * @param {object} pool - pg Pool
 * @param {number} userId - recipient user id
 * @param {{ title: string, body: string, data?: object }} opts - notification title/body and optional data (e.g. threadId)
 */
async function sendPushToUser(pool, userId, { title, body, data = {} }) {
  const msg = getMessaging();
  if (!msg) {
    return; // already logged in getMessaging
  }
  if (!pool) {
    console.warn('[push] No database pool; push skipped for user', userId);
    return;
  }
  try {
    const { rows: userRows } = await pool.query(
      'SELECT COALESCE(push_enabled, true) AS push_enabled FROM users WHERE id = $1',
      [userId]
    );
    if (!userRows[0] || userRows[0].push_enabled === false) {
      return; // user has disabled push
    }
    const { rows } = await pool.query(
      'SELECT id, token FROM user_push_tokens WHERE user_id = $1',
      [userId]
    );
    if (!rows.length) {
      console.log('[push] No tokens for user', userId, '(user may not have registered device for push)');
      return;
    }
    const tokens = rows.map((r) => r.token);
    // FCM data payload requires all values to be strings
    const dataPayload = { ...data, title: String(title || ''), body: String(body || '') };
    Object.keys(dataPayload).forEach((k) => { dataPayload[k] = String(dataPayload[k]); });
    const message = {
      notification: { title: title || 'New message', body: body || 'You have a new message' },
      data: dataPayload,
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          priority: 'high',
          icon: 'ic_notification'
        }
      },
      tokens
    };
    const res = await msg.sendEachForMulticast(message);
    console.log('[push] Sent to user', userId, ':', res.successCount, 'ok,', res.failureCount, 'failed');
    if (res.failureCount > 0) {
      const toRemove = [];
      res.responses.forEach((r, i) => {
        if (!r.success) {
          const code = r.error?.code || r.error?.message || '';
          console.warn('[push] Token failed:', code, r.error?.message || '');
          if (code === 'invalid-registration-token' || code === 'registration-token-not-registered') {
            toRemove.push(rows[i].id);
          }
        }
      });
      if (toRemove.length) {
        await pool.query('DELETE FROM user_push_tokens WHERE id = ANY($1)', [toRemove]);
      }
    }
  } catch (err) {
    console.error('[push] send error:', err.message);
  }
}

module.exports = { sendPushToUser, getMessaging };
