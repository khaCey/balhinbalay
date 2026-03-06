const express = require('express');
const bcrypt = require('bcryptjs');
const { signToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

function getPool(req) {
  return req.app.get('pool');
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { email, password, name } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase().slice(0, 254);
  if (!normalizedEmail || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters.' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const safeName = (name || '').trim().slice(0, 200) || normalizedEmail;
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
       RETURNING id, email, name, role, account_status`,
      [normalizedEmail, passwordHash, safeName]
    );
    const user = rows[0];
    const status = (user.account_status || 'active').toLowerCase();
    if (status === 'suspended') return res.status(403).json({ ok: false, message: 'Account suspended.' });
    if (status === 'banned') return res.status(403).json({ ok: false, message: 'Account banned.' });
    const token = signToken({ id: user.id, email: user.email });
    return res.status(201).json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role || 'user' } });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ ok: false, message: 'An account with this email already exists.' });
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { email, password } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required.' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, password_hash, role, account_status FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ ok: false, message: 'Invalid email or password.' });
    }
    const status = (user.account_status || 'active').toLowerCase();
    if (status === 'suspended') return res.status(403).json({ ok: false, message: 'Account suspended.' });
    if (status === 'banned') return res.status(403).json({ ok: false, message: 'Account banned.' });
    const token = signToken({ id: user.id, email: user.email });
    return res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name || user.email, role: user.role || 'user' } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Login failed.' });
  }
});

// GET /api/auth/me (optional; requires auth)
router.get('/me', authMiddleware, async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  try {
    const { rows } = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ id: rows[0].id, email: rows[0].email, name: rows[0].name, role: rows[0].role || 'user' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
