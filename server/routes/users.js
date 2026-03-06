const express = require('express');
const bcrypt = require('bcryptjs');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function getPool(req) {
  return req.app.get('pool');
}

// GET /api/users/me
router.get('/me', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  try {
    const { rows } = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/me
router.patch('/me', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { name, email } = req.body || {};
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
    if (updates.length === 0) return res.status(400).json({ ok: false, message: 'Nothing to update.' });
    values.push(req.user.id);
    await pool.query(`UPDATE users SET updated_at = now(), ${updates.join(', ')} WHERE id = $${i}`, values);
    const { rows } = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [req.user.id]);
    return res.json(rows[0]);
  } catch (err) {
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

module.exports = router;
