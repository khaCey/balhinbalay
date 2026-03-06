const express = require('express');
const { authMiddleware, requireRoles } = require('../middleware/auth');
const { mapListingRow } = require('../lib/listings');

const router = express.Router();
const LISTING_COLS = 'id, owner_id, title, listing_type, type, price, city_id, location, beds, baths, size_sqm, description, images, coordinates, contact_agent_name, contact_phone, contact_email, date_posted, status, created_at';

function getPool(req) {
  return req.app.get('pool');
}

router.use(authMiddleware);
router.use(requireRoles(['admin']));

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  try {
    const [usersRes, pendingRes, approvedRes] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS c FROM users'),
      pool.query("SELECT COUNT(*)::int AS c FROM listings WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*)::int AS c FROM listings WHERE status = 'approved'")
    ]);
    res.json({
      users: usersRes.rows[0]?.c ?? 0,
      pendingListings: pendingRes.rows[0]?.c ?? 0,
      approvedListings: approvedRes.rows[0]?.c ?? 0
    });
  } catch (err) {
    err.status = 500;
    next(err);
  }
});

// GET /api/admin/listings (all statuses)
router.get('/listings', async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  try {
    const { rows } = await pool.query(
      `SELECT l.id, l.owner_id, l.title, l.listing_type, l.type, l.price, l.city_id, l.location, l.beds, l.baths, l.size_sqm, l.description, l.images, l.coordinates, l.contact_agent_name, l.contact_phone, l.contact_email, l.date_posted, l.status, l.created_at, u.email AS owner_email
       FROM listings l
       LEFT JOIN users u ON u.id = l.owner_id
       ORDER BY l.created_at DESC`
    );
    res.json(rows.map(row => {
      const listing = mapListingRow(row);
      listing.ownerEmail = row.owner_email || '';
      return listing;
    }));
  } catch (err) {
    err.status = 500;
    next(err);
  }
});

// GET /api/admin/listings/pending
router.get('/listings/pending', async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  try {
    const { rows } = await pool.query(
      "SELECT " + LISTING_COLS + " FROM listings WHERE status = 'pending' ORDER BY created_at DESC"
    );
    res.json(rows.map(row => mapListingRow(row)));
  } catch (err) {
    err.status = 500;
    next(err);
  }
});

// DELETE /api/admin/listings/:id
router.delete('/listings/:id', async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const id = req.params.id;
  try {
    const { rowCount } = await pool.query('DELETE FROM listings WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Listing not found' });
    res.status(204).send();
  } catch (err) {
    err.status = 500;
    next(err);
  }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, account_status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows.map(r => ({
      id: r.id,
      email: r.email,
      name: r.name || '',
      role: r.role || 'user',
      accountStatus: r.account_status || 'active',
      createdAt: r.created_at
    })));
  } catch (err) {
    err.status = 500;
    next(err);
  }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const id = req.params.id;
  const accountStatus = (req.body && req.body.accountStatus) || '';
  const status = ['active', 'suspended', 'banned'].includes(accountStatus) ? accountStatus : null;
  if (!status) return res.status(400).json({ error: 'accountStatus must be active, suspended, or banned' });
  if (id === req.user.id) return res.status(400).json({ error: 'Cannot change your own account status' });
  try {
    const { rows: existing } = await pool.query('SELECT id, role FROM users WHERE id = $1', [id]);
    if (!existing[0]) return res.status(404).json({ error: 'User not found' });
    const { rowCount } = await pool.query(
      'UPDATE users SET account_status = $1, updated_at = now() WHERE id = $2',
      [status, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'User not found' });
    const { rows } = await pool.query('SELECT id, email, name, role, account_status, created_at FROM users WHERE id = $1', [id]);
    res.json({
      id: rows[0].id,
      email: rows[0].email,
      name: rows[0].name || '',
      role: rows[0].role || 'user',
      accountStatus: rows[0].account_status || 'active',
      createdAt: rows[0].created_at
    });
  } catch (err) {
    err.status = 500;
    next(err);
  }
});

module.exports = router;
