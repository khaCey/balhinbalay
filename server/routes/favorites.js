const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function getPool(req) {
  return req.app.get('pool');
}

// GET /api/favorites — return listing IDs for current user
router.get('/', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.json([]);
  try {
    const { rows } = await pool.query('SELECT listing_id FROM favorites WHERE user_id = $1', [req.user.id]);
    res.json(rows.map(r => r.listing_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/favorites — body: { listingId }
router.post('/', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const listingId = req.body && req.body.listingId;
  if (!listingId) return res.status(400).json({ error: 'listingId is required' });
  try {
    await pool.query(
      'INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) ON CONFLICT (user_id, listing_id) DO NOTHING',
      [req.user.id, listingId]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Listing not found' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/favorites/:listingId
router.delete('/:listingId', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { listingId } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2', [req.user.id, listingId]);
    res.status(rowCount ? 204 : 404).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
