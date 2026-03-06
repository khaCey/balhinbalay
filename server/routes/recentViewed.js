const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function getPool(req) {
  return req.app.get('pool');
}

// GET /api/recently-viewed — return list of listing IDs (most recent first)
router.get('/', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.json([]);
  try {
    const { rows } = await pool.query(
      `SELECT listing_id FROM (
        SELECT listing_id, viewed_at,
          ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY viewed_at DESC) AS rn
        FROM recently_viewed WHERE user_id = $1
      ) sub WHERE rn = 1 ORDER BY viewed_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(rows.map(r => r.listing_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/recently-viewed — body: { listingId }
router.post('/', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const listingId = req.body && req.body.listingId;
  if (!listingId) return res.status(400).json({ error: 'listingId is required' });
  try {
    await pool.query(
      'INSERT INTO recently_viewed (user_id, listing_id) VALUES ($1, $2)',
      [req.user.id, listingId]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Listing not found' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
