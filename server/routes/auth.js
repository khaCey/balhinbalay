const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { signToken, authMiddleware } = require('../middleware/auth');
const { sendConfirmationEmail } = require('../services/email');

const router = express.Router();

function getPool(req) {
  return req.app.get('pool');
}

function getAppUrl(req) {
  const url = process.env.APP_URL || req.protocol + '://' + (req.get('host') || 'localhost:3000');
  return url.replace(/\/$/, '');
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
  const confirmationToken = crypto.randomBytes(32).toString('hex');
  const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, email_verified, confirmation_token, confirmation_expires)
       VALUES ($1, $2, $3, false, $4, $5)
       RETURNING id, email, name, role, account_status`,
      [normalizedEmail, passwordHash, safeName, confirmationToken, confirmationExpires]
    );
    const user = rows[0];
    const appUrl = getAppUrl(req);
    const confirmUrl = `${appUrl}/confirm-email?token=${confirmationToken}`;
    try {
      await sendConfirmationEmail(normalizedEmail, confirmUrl, safeName);
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr.message);
      // Still return success - user can use resend later
    }
    return res.status(201).json({
      ok: true,
      message: 'Check your email to confirm your account.',
      requiresConfirmation: true
    });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ ok: false, message: 'An account with this email already exists.' });
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Registration failed.' });
  }
});

// GET /api/auth/confirm-email?token=xxx
router.get('/confirm-email', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const token = (req.query.token || '').trim();
  if (!token) {
    return res.status(400).json({ ok: false, message: 'Token is required.' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE users SET email_verified = true, confirmation_token = NULL, confirmation_expires = NULL
       WHERE confirmation_token = $1 AND confirmation_expires > now()
       RETURNING id, email`,
      [token]
    );
    if (rows.length === 0) {
      const { rows: expired } = await pool.query('SELECT 1 FROM users WHERE confirmation_token = $1', [token]);
      if (expired.length > 0) {
        return res.status(400).json({ ok: false, message: 'Confirmation link has expired. Please request a new one.' });
      }
      return res.status(400).json({ ok: false, message: 'Invalid confirmation token.' });
    }
    return res.json({ ok: true, message: 'Email confirmed. You can now log in.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Confirmation failed.' });
  }
});

// POST /api/auth/resend-confirmation
router.post('/resend-confirmation', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { email } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return res.status(400).json({ ok: false, message: 'Email is required.' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, email_verified FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );
    const user = rows[0];
    if (!user) {
      return res.json({ ok: true, message: 'If an account exists for this email, a confirmation link was sent.' });
    }
    if (user.email_verified) {
      return res.json({ ok: true, message: 'This email is already confirmed. You can log in.' });
    }
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      'UPDATE users SET confirmation_token = $1, confirmation_expires = $2 WHERE id = $3',
      [confirmationToken, confirmationExpires, user.id]
    );
    const appUrl = getAppUrl(req);
    const confirmUrl = `${appUrl}/confirm-email?token=${confirmationToken}`;
    try {
      await sendConfirmationEmail(normalizedEmail, confirmUrl, user.name);
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr.message);
      return res.status(500).json({ ok: false, message: 'Failed to send confirmation email.' });
    }
    return res.json({ ok: true, message: 'Confirmation email sent. Check your inbox.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Request failed.' });
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
      'SELECT id, email, name, password_hash, role, account_status, email_verified FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ ok: false, message: 'Invalid email or password.' });
    }
    const status = (user.account_status || 'active').toLowerCase();
    if (status === 'suspended') return res.status(403).json({ ok: false, message: 'Account suspended.' });
    if (status === 'banned') return res.status(403).json({ ok: false, message: 'Account banned.' });
    if (!user.email_verified) {
      return res.status(400).json({
        ok: false,
        message: 'Please verify your email before logging in. Check your inbox or request a new confirmation link.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }
    const token = signToken({ id: user.id, email: user.email });
    return res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name || user.email, role: user.role || 'user' } });
  } catch (err) {
    console.error('[auth/login]', err.message || err);
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      return res.status(503).json({ ok: false, message: 'Database unavailable. Check that PostgreSQL is running.' });
    }
    if (err.code === '42P01' || err.code === '42703') {
      return res.status(500).json({ ok: false, message: 'Database schema out of date. From project root run: npm run migrate' });
    }
    return res.status(500).json({ ok: false, message: 'Login failed. Check server logs for details.' });
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
