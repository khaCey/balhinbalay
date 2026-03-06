const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function getPool(req) {
  return req.app.get('pool');
}

function rowToSavedSearch(row) {
  return {
    id: row.id,
    name: row.name,
    listingType: row.listing_type || undefined,
    propertyType: row.property_type || undefined,
    priceRangeIndex: row.price_range_index != null ? row.price_range_index : undefined,
    selectedRegion: row.selected_region || undefined,
    selectedProvince: row.selected_province || undefined,
    selectedCity: row.selected_city || undefined,
    searchQuery: row.search_query || undefined,
    minBeds: row.min_beds != null ? row.min_beds : undefined,
    minBaths: row.min_baths != null ? row.min_baths : undefined,
    sizeRangeMin: row.size_range_min != null ? row.size_range_min : undefined,
    sizeRangeMax: row.size_range_max != null ? row.size_range_max : undefined,
    sortBy: row.sort_by || undefined,
    createdAt: row.created_at
  };
}

// GET /api/saved-searches
router.get('/', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.json([]);
  try {
    const { rows } = await pool.query(
      'SELECT id, name, listing_type, property_type, price_range_index, selected_region, selected_province, selected_city, search_query, min_beds, min_baths, size_range_min, size_range_max, sort_by, created_at FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows.map(rowToSavedSearch));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/saved-searches — body: name + filter state
router.post('/', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const b = req.body || {};
  const name = (b.name || '').trim().slice(0, 200);
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO saved_searches (user_id, name, listing_type, property_type, price_range_index, selected_region, selected_province, selected_city, search_query, min_beds, min_baths, size_range_min, size_range_max, sort_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, name, listing_type, property_type, price_range_index, selected_region, selected_province, selected_city, search_query, min_beds, min_baths, size_range_min, size_range_max, sort_by, created_at`,
      [
        req.user.id, name,
        b.listingType || null, b.propertyType || null, b.priceRangeIndex ?? null,
        b.selectedRegion || null, b.selectedProvince || null, b.selectedCity || null,
        (b.searchQuery || '').slice(0, 500) || null,
        b.minBeds ?? null, b.minBaths ?? null, b.sizeRangeMin ?? null, b.sizeRangeMax ?? null,
        (b.sortBy || '').slice(0, 30) || null
      ]
    );
    res.status(201).json(rowToSavedSearch(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/saved-searches/:id
router.delete('/:id', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const id = req.params.id;
  try {
    const { rowCount } = await pool.query('DELETE FROM saved_searches WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.status(rowCount ? 204 : 404).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
