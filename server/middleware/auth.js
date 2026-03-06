const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'balhinbalay-dev-secret-change-in-production';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const pool = req.app.get('pool');
  if (!pool) {
    req.user = { id: payload.id, email: payload.email, role: 'user', account_status: 'active' };
    return next();
  }
  try {
    const { rows } = await pool.query(
      'SELECT id, email, role, account_status FROM users WHERE id = $1',
      [payload.id]
    );
    if (!rows[0]) {
      return res.status(401).json({ error: 'User not found' });
    }
    const accountStatus = (rows[0].account_status || 'active').toLowerCase();
    if (accountStatus === 'suspended') {
      return res.status(403).json({ error: 'Account suspended' });
    }
    if (accountStatus === 'banned') {
      return res.status(403).json({ error: 'Account banned' });
    }
    req.user = {
      id: rows[0].id,
      email: rows[0].email,
      role: rows[0].role || 'user',
      account_status: rows[0].account_status
    };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

function requireRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRoles, signToken, verifyToken, JWT_SECRET };
