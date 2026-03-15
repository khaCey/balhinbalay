const express = require('express');
const bcrypt = require('bcryptjs');
const { authMiddleware } = require('../middleware/auth');
const { processImages } = require('../lib/imageProcessor');

const router = express.Router();

function getPool(req) {
  return req.app.get('pool');
}

// POST /api/users/revoke-push-token — no auth; removes token from DB so device stops receiving push when no one is logged in (body: { token })
router.post('/revoke-push-token', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const token = (req.body && req.body.token) ? String(req.body.token).trim() : '';
  if (!token) return res.status(400).json({ error: 'token is required' });
  try {
    const { rowCount } = await pool.query('DELETE FROM user_push_tokens WHERE token = $1', [token]);
    console.log('[push] Token revoked (no user logged in), rows removed:', rowCount);
    return res.json({ ok: true });
  } catch (err) {
    if (err.code === '42P01') return res.status(503).json({ error: 'Push tokens table not available.' });
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.use(authMiddleware);

// GET /api/users/me
router.get('/me', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, COALESCE(push_enabled, true) AS push_enabled, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    const u = rows[0];
    res.json({ id: u.id, email: u.email, name: u.name, push_enabled: !!u.push_enabled, avatar_url: u.avatar_url || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/me
router.patch('/me', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { name, email, push_enabled, avatar_url: avatarUrl } = req.body || {};
  try {
    const updates = [];
    const values = [];
    let i = 1;
    if (name !== undefined) {
      const safeName = (name || '').trim().slice(0, 200);
      updates.push(`name = $${i++}`);
      values.push(safeName || null);
    }
    if (email !== undefined) {
      const normalized = (email || '').trim().toLowerCase().slice(0, 254);
      if (!normalized) return res.status(400).json({ ok: false, message: 'Email is required.' });
      const { rows: existing } = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2', [normalized, req.user.id]);
      if (existing.length > 0) return res.status(400).json({ ok: false, message: 'An account with this email already exists.' });
      updates.push(`email = $${i++}`);
      values.push(normalized);
    }
    if (push_enabled !== undefined) {
      updates.push(`push_enabled = $${i++}`);
      values.push(!!push_enabled);
    }
    if (avatarUrl !== undefined) {
      const url = avatarUrl === null || avatarUrl === '' ? null : String(avatarUrl).trim().slice(0, 500);
      updates.push(`avatar_url = $${i++}`);
      values.push(url);
    }
    if (updates.length === 0) return res.status(400).json({ ok: false, message: 'Nothing to update.' });
    values.push(req.user.id);
    await pool.query(`UPDATE users SET updated_at = now(), ${updates.join(', ')} WHERE id = $${i}`, values);
    const { rows } = await pool.query(
      'SELECT id, email, name, COALESCE(push_enabled, true) AS push_enabled, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    );
    const u = rows[0];
    return res.json({ id: u.id, email: u.email, name: u.name, push_enabled: !!u.push_enabled, avatar_url: u.avatar_url || null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/me/avatar — upload profile picture (body: { image: dataUrl }); processes and saves, returns { avatar_url }
router.post('/me/avatar', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const dataUrl = req.body && req.body.image ? String(req.body.image).trim() : '';
  if (!dataUrl || !/^data:image\/\w+;base64,/.test(dataUrl)) {
    return res.status(400).json({ error: 'image (data URL) is required' });
  }
  try {
    const urls = await processImages([dataUrl]);
    const avatarUrl = urls.length > 0 ? urls[0] : null;
    await pool.query('UPDATE users SET updated_at = now(), avatar_url = $1 WHERE id = $2', [avatarUrl, req.user.id]);
    return res.json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/me/avatar — remove profile picture
router.delete('/me/avatar', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  try {
    await pool.query('UPDATE users SET updated_at = now(), avatar_url = NULL WHERE id = $1', [req.user.id]);
    return res.json({ avatar_url: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/me/push-token — check if current user has any push token registered
router.get('/me/push-token', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  try {
    const { rows } = await pool.query('SELECT 1 FROM user_push_tokens WHERE user_id = $1 LIMIT 1', [req.user.id]);
    return res.json({ registered: rows.length > 0 });
  } catch (err) {
    if (err.code === '42P01') return res.status(503).json({ error: 'Push tokens table not available. Run migrations.' });
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/me/push-token — register FCM/APNs token for push notifications (body: { token, platform })
// Token is reassigned to current user only (removed from any other user) so one device gets pushes for one account.
router.post('/me/push-token', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const token = (req.body && req.body.token) ? String(req.body.token).trim() : '';
  const platform = (req.body && req.body.platform) ? String(req.body.platform).trim().slice(0, 20) : 'android';
  if (!token) return res.status(400).json({ error: 'token is required' });
  try {
    await pool.query('DELETE FROM user_push_tokens WHERE token = $1', [token]);
    await pool.query(
      `INSERT INTO user_push_tokens (user_id, token, platform)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, token) DO UPDATE SET platform = EXCLUDED.platform`,
      [req.user.id, token, platform]
    );
    console.log('[push] Token registered for user', req.user.id, 'platform:', platform);
    return res.json({ ok: true });
  } catch (err) {
    if (err.code === '42P01') return res.status(503).json({ error: 'Push tokens table not available. Run migrations.' });
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/me/push-token — remove token so server stops sending push (body: { token } optional; if omitted, remove all for user)
router.delete('/me/push-token', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const token = (req.body && req.body.token) ? String(req.body.token).trim() : null;
  try {
    if (token) {
      await pool.query('DELETE FROM user_push_tokens WHERE user_id = $1 AND token = $2', [req.user.id, token]);
    } else {
      await pool.query('DELETE FROM user_push_tokens WHERE user_id = $1', [req.user.id]);
    }
    return res.json({ ok: true });
  } catch (err) {
    if (err.code === '42P01') return res.status(503).json({ error: 'Push tokens table not available. Run migrations.' });
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/me/change-password
router.post('/me/change-password', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ ok: false, message: 'Current and new password are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ ok: false, message: 'New password must be at least 8 characters.' });
  }
  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    if (!bcrypt.compareSync(currentPassword, rows[0].password_hash)) {
      return res.status(400).json({ ok: false, message: 'Current password is incorrect.' });
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [hash, req.user.id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/me — delete account and all related data (body: { password } required)
router.delete('/me', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const password = (req.body && req.body.password) ? String(req.body.password) : '';
  if (!password) {
    return res.status(400).json({ ok: false, message: 'Password is required to delete your account.' });
  }
  try {
    const { rows } = await pool.query('SELECT id, password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    if (!bcrypt.compareSync(password, rows[0].password_hash)) {
      return res.status(400).json({ ok: false, message: 'Incorrect password.' });
    }
    const userId = req.user.id;
    await pool.query('DELETE FROM listings WHERE owner_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    return res.json({ ok: true, message: 'Account and all associated data have been deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Could not delete account.' });
  }
});

module.exports = router;
