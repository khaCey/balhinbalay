const express = require('express');
const { authMiddleware, requireRoles } = require('../middleware/auth');
const { mapListingRow } = require('../lib/listings');
const { processImages } = require('../lib/imageProcessor');

const router = express.Router();
const COLS = 'id, owner_id, title, listing_type, type, price, city_id, location, beds, baths, size_sqm, description, images, coordinates, contact_agent_name, contact_phone, contact_email, date_posted, status, created_at';

function getPool(req) {
  return req.app.get('pool');
}

router.get('/', async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.json([]);
  try {
    let query = "SELECT " + COLS + " FROM listings WHERE status = 'approved'";
    const values = [];
    const includeMine = req.query.includeMine === '1' && req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
    if (includeMine) {
      const { verifyToken } = require('../middleware/auth');
      const payload = verifyToken(req.headers.authorization.slice(7));
      if (payload && payload.id) {
        query = "SELECT " + COLS + " FROM listings WHERE status = 'approved' OR owner_id = $1";
        values.push(payload.id);
      }
    }
    query += " ORDER BY date_posted DESC";
    const { rows } = values.length ? await pool.query(query, values) : await pool.query(query);
    res.json(rows.map(row => mapListingRow(row)));
  } catch (err) {
    err.status = 500;
    err.message = err.message || 'Database error';
    next(err);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const b = req.body || {};
  const title = (b.title || '').trim().slice(0, 500);
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const listingType = b.listingType === 'rent' ? 'rent' : 'sale';
  const type = (b.type || 'House').toString().slice(0, 50);
  const price = Math.max(0, parseInt(b.price, 10) || 0);
  const cityId = (b.cityId || '').toString().slice(0, 50);
  const location = (b.location || '').trim().slice(0, 500);
  const beds = Math.max(0, parseInt(b.beds, 10) || 0);
  const baths = Math.max(0, parseInt(b.baths, 10) || 0);
  const sizeSqm = Math.max(0, parseInt(b.sizeSqm, 10) || 0);
  const description = (b.description || '').slice(0, 50000);
  const defaultImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  let processedImages = [];
  try {
    processedImages = await processImages(Array.isArray(b.images) ? b.images : []);
  } catch (err) {
    console.warn('Image processing error:', err?.message || err);
  }
  const images = JSON.stringify(processedImages.length ? processedImages : [defaultImage]);
  const coordinates = b.coordinates && typeof b.coordinates === 'object' ? JSON.stringify(b.coordinates) : null;
  const contactAgentName = (b.contactInfo && b.contactInfo.agentName) ? (b.contactInfo.agentName || '').slice(0, 200) : null;
  const contactPhone = (b.contactInfo && b.contactInfo.phone) ? (b.contactInfo.phone || '').slice(0, 50) : null;
  const contactEmail = (b.contactInfo && b.contactInfo.email) ? (b.contactInfo.email || '').slice(0, 254) : null;
  try {
    const q = 'INSERT INTO listings (owner_id, title, listing_type, type, price, city_id, location, beds, baths, size_sqm, description, images, coordinates, contact_agent_name, contact_phone, contact_email, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14, $15, $16, \'pending\') RETURNING ' + COLS;
    const { rows } = await pool.query(q, [req.user.id, title, listingType, type, price, cityId, location, beds, baths, sizeSqm, description, images, coordinates, contactAgentName, contactPhone, contactEmail]);
    res.status(201).json(mapListingRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.patch('/:id/status', authMiddleware, requireRoles(['admin', 'moderator']), async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const id = req.params.id;
  const s = (req.body && req.body.status) || '';
  const status = ['approved', 'rejected', 'unlisted'].includes(s) ? s : null;
  if (!status) return res.status(400).json({ error: 'status must be approved, rejected, or unlisted' });
  try {
    const { rows: existing } = await pool.query('SELECT id FROM listings WHERE id = $1', [id]);
    if (!existing[0]) return res.status(404).json({ error: 'Listing not found' });
    await pool.query('UPDATE listings SET status = $1, updated_at = now() WHERE id = $2', [status, id]);
    const { rows } = await pool.query('SELECT ' + COLS + ' FROM listings WHERE id = $1', [id]);
    res.json(mapListingRow(rows[0]));
  } catch (err) {
    err.status = 500;
    next(err);
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const id = req.params.id;
  const { rows: existing } = await pool.query('SELECT id, owner_id FROM listings WHERE id = $1', [id]);
  if (!existing[0]) return res.status(404).json({ error: 'Listing not found' });
  if (existing[0].owner_id !== req.user.id) return res.status(403).json({ error: 'Only the owner can update this listing' });
  const b = req.body || {};
  const updates = [];
  const values = [];
  let i = 1;
  if (b.title !== undefined) { updates.push('title = $' + i++); values.push((b.title || '').trim().slice(0, 500)); }
  if (b.listingType !== undefined) { updates.push('listing_type = $' + i++); values.push(b.listingType === 'rent' ? 'rent' : 'sale'); }
  if (b.type !== undefined) { updates.push('type = $' + i++); values.push((b.type || 'House').toString().slice(0, 50)); }
  if (b.price !== undefined) { updates.push('price = $' + i++); values.push(Math.max(0, parseInt(b.price, 10) || 0)); }
  if (b.cityId !== undefined) { updates.push('city_id = $' + i++); values.push((b.cityId || '').toString().slice(0, 50)); }
  if (b.location !== undefined) { updates.push('location = $' + i++); values.push((b.location || '').trim().slice(0, 500)); }
  if (b.beds !== undefined) { updates.push('beds = $' + i++); values.push(Math.max(0, parseInt(b.beds, 10) || 0)); }
  if (b.baths !== undefined) { updates.push('baths = $' + i++); values.push(Math.max(0, parseInt(b.baths, 10) || 0)); }
  if (b.sizeSqm !== undefined) { updates.push('size_sqm = $' + i++); values.push(Math.max(0, parseInt(b.sizeSqm, 10) || 0)); }
  if (b.description !== undefined) { updates.push('description = $' + i++); values.push((b.description || '').slice(0, 50000)); }
  if (b.images !== undefined) {
    let processedImages = [];
    try {
      processedImages = await processImages(Array.isArray(b.images) ? b.images : []);
    } catch (err) {
      console.warn('Image processing error:', err?.message || err);
    }
    updates.push('images = $' + i++);
    values.push(processedImages.length ? JSON.stringify(processedImages) : null);
  }
  if (b.coordinates !== undefined) { updates.push('coordinates = $' + i++); values.push(b.coordinates && typeof b.coordinates === 'object' ? JSON.stringify(b.coordinates) : null); }
  if (b.contactInfo) {
    if (b.contactInfo.agentName !== undefined) { updates.push('contact_agent_name = $' + i++); values.push((b.contactInfo.agentName || '').slice(0, 200)); }
    if (b.contactInfo.phone !== undefined) { updates.push('contact_phone = $' + i++); values.push((b.contactInfo.phone || '').slice(0, 50)); }
    if (b.contactInfo.email !== undefined) { updates.push('contact_email = $' + i++); values.push((b.contactInfo.email || '').slice(0, 254)); }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });
  values.push(id);
  await pool.query('UPDATE listings SET updated_at = now(), ' + updates.join(', ') + ' WHERE id = $' + i, values);
  const { rows } = await pool.query('SELECT ' + COLS + ' FROM listings WHERE id = $1', [id]);
  res.json(mapListingRow(rows[0]));
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const id = req.params.id;
  const { rows } = await pool.query('SELECT id, owner_id FROM listings WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Listing not found' });
  if (rows[0].owner_id !== req.user.id) return res.status(403).json({ error: 'Only the owner can delete this listing' });
  await pool.query('DELETE FROM listings WHERE id = $1', [id]);
  res.status(204).send();
});

module.exports = router;
