const express = require('express');
const { authMiddleware, requireRoles } = require('../middleware/auth');
const { mapListingRow } = require('../lib/listings');
const { processImages } = require('../lib/imageProcessor');

const router = express.Router();
const COLS = 'id, owner_id, title, listing_type, type, price, city_id, location, beds, baths, size_sqm, description, images, coordinates, contact_agent_name, contact_phone, contact_email, date_posted, status, created_at, key_money, security_deposit, extra_fees, advance_pay, broker_fee, association_fee, utilities_included, reservation_fee, furnished, sold, currently_rented, available_from';

function getPool(req) {
  return req.app.get('pool');
}

router.get('/', async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.json([]);
  try {
    const conditions = ["status = 'approved'", "(listing_type <> 'sale' OR sold = false)"];
    const values = [];
    let paramIndex = 1;

    const includeMine = req.query.includeMine === '1' && req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
    let ownerIdForMine = null;
    if (includeMine) {
      const { verifyToken } = require('../middleware/auth');
      const payload = verifyToken(req.headers.authorization.slice(7));
      if (payload && payload.id) ownerIdForMine = payload.id;
    }

    const listingType = (req.query.listingType || '').toLowerCase();
    if (listingType === 'sale' || listingType === 'rent') {
      conditions.push(`listing_type = $${paramIndex}`);
      values.push(listingType);
      paramIndex++;
    }

    const priceMin = req.query.priceMin != null && req.query.priceMin !== '' ? parseInt(req.query.priceMin, 10) : null;
    if (priceMin != null && !Number.isNaN(priceMin)) {
      conditions.push(`price >= $${paramIndex}`);
      values.push(priceMin);
      paramIndex++;
    }
    const priceMax = req.query.priceMax != null && req.query.priceMax !== '' ? parseInt(req.query.priceMax, 10) : null;
    if (priceMax != null && !Number.isNaN(priceMax)) {
      conditions.push(`price <= $${paramIndex}`);
      values.push(priceMax);
      paramIndex++;
    }

    const cityId = (req.query.cityId || '').trim().slice(0, 50);
    if (cityId && cityId !== 'cebu-province') {
      conditions.push(`city_id = $${paramIndex}`);
      values.push(cityId);
      paramIndex++;
    }

    const cityIdsRaw = (req.query.cityIds || '').trim();
    if (cityIdsRaw && !cityId) {
      const cityIds = cityIdsRaw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 200);
      if (cityIds.length > 0) {
        conditions.push(`city_id = ANY($${paramIndex}::text[])`);
        values.push(cityIds);
        paramIndex++;
      }
    }

    const type = (req.query.type || '').trim().slice(0, 50);
    if (type) {
      conditions.push(`type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }

    const furnished = (req.query.furnished || '').trim().slice(0, 50);
    if (furnished) {
      conditions.push(`LOWER(COALESCE(furnished, '')) = $${paramIndex}`);
      values.push(furnished.toLowerCase());
      paramIndex++;
    }

    const minBeds = req.query.minBeds != null && req.query.minBeds !== '' ? parseInt(req.query.minBeds, 10) : null;
    if (minBeds != null && !Number.isNaN(minBeds) && minBeds > 0) {
      conditions.push(`beds >= $${paramIndex}`);
      values.push(minBeds);
      paramIndex++;
    }
    const minBaths = req.query.minBaths != null && req.query.minBaths !== '' ? parseInt(req.query.minBaths, 10) : null;
    if (minBaths != null && !Number.isNaN(minBaths) && minBaths > 0) {
      conditions.push(`baths >= $${paramIndex}`);
      values.push(minBaths);
      paramIndex++;
    }

    const sizeMin = req.query.sizeMin != null && req.query.sizeMin !== '' ? parseInt(req.query.sizeMin, 10) : null;
    if (sizeMin != null && !Number.isNaN(sizeMin) && sizeMin > 0) {
      conditions.push(`size_sqm >= $${paramIndex}`);
      values.push(sizeMin);
      paramIndex++;
    }
    const sizeMax = req.query.sizeMax != null && req.query.sizeMax !== '' ? parseInt(req.query.sizeMax, 10) : null;
    if (sizeMax != null && !Number.isNaN(sizeMax) && sizeMax > 0) {
      conditions.push(`size_sqm <= $${paramIndex}`);
      values.push(sizeMax);
      paramIndex++;
    }

    const qKeyword = (req.query.q || '').trim().slice(0, 200);
    if (qKeyword) {
      const qPattern = '%' + qKeyword.replace(/%/g, '\\%').replace(/_/g, '\\_') + '%';
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`);
      values.push(qPattern);
      paramIndex++;
    }

    const sort = (req.query.sort || 'newest').toLowerCase();
    const orderClause = (() => {
      switch (sort) {
        case 'price-asc': return 'ORDER BY price ASC, date_posted DESC';
        case 'price-desc': return 'ORDER BY price DESC, date_posted DESC';
        case 'size-asc': return 'ORDER BY size_sqm ASC NULLS LAST, date_posted DESC';
        case 'size-desc': return 'ORDER BY size_sqm DESC NULLS LAST, date_posted DESC';
        case 'newest':
        default: return 'ORDER BY date_posted DESC';
      }
    })();

    let whereClause = conditions.join(' AND ');
    if (ownerIdForMine) {
      whereClause = `(${whereClause}) OR owner_id = $${paramIndex}`;
      values.push(ownerIdForMine);
    }

    const limit = 500;
    const query = `SELECT ${COLS} FROM listings WHERE ${whereClause} ${orderClause} LIMIT ${limit}`;
    const { rows } = await pool.query(query, values);
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
  const keyMoney = b.keyMoney != null ? Math.max(0, parseInt(b.keyMoney, 10) || 0) : null;
  const securityDeposit = b.securityDeposit != null ? Math.max(0, parseInt(b.securityDeposit, 10) || 0) : null;
  const extraFees = (b.extraFees != null && String(b.extraFees).trim()) ? String(b.extraFees).trim().slice(0, 500) : null;
  const advancePay = b.advancePay != null ? Math.max(0, parseInt(b.advancePay, 10) || 0) : null;
  const brokerFee = b.brokerFee != null ? Math.max(0, parseInt(b.brokerFee, 10) || 0) : null;
  const associationFee = b.associationFee != null ? Math.max(0, parseInt(b.associationFee, 10) || 0) : null;
  const utilitiesIncluded = b.utilitiesIncluded !== undefined ? !!b.utilitiesIncluded : null;
  const reservationFee = b.reservationFee != null ? Math.max(0, parseInt(b.reservationFee, 10) || 0) : null;
  const furnished = (b.furnished != null && String(b.furnished).trim()) ? String(b.furnished).trim().slice(0, 50) : null;
  const sold = !!b.sold;
  const currentlyRented = !!b.currentlyRented;
  const availableFrom = (b.availableFrom != null && String(b.availableFrom).trim()) ? String(b.availableFrom).trim().slice(0, 100) : null;
  try {
    const q = 'INSERT INTO listings (owner_id, title, listing_type, type, price, city_id, location, beds, baths, size_sqm, description, images, coordinates, contact_agent_name, contact_phone, contact_email, status, key_money, security_deposit, extra_fees, advance_pay, broker_fee, association_fee, utilities_included, reservation_fee, furnished, sold, currently_rented, available_from) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14, $15, $16, \'pending\', $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28) RETURNING ' + COLS;
    const { rows } = await pool.query(q, [req.user.id, title, listingType, type, price, cityId, location, beds, baths, sizeSqm, description, images, coordinates, contactAgentName, contactPhone, contactEmail, keyMoney, securityDeposit, extraFees, advancePay, brokerFee, associationFee, utilitiesIncluded, reservationFee, furnished, sold, currentlyRented, availableFrom]);
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
  if (b.keyMoney !== undefined) { updates.push('key_money = $' + i++); values.push(b.keyMoney == null || b.keyMoney === '' ? null : Math.max(0, parseInt(b.keyMoney, 10) || 0)); }
  if (b.securityDeposit !== undefined) { updates.push('security_deposit = $' + i++); values.push(b.securityDeposit == null || b.securityDeposit === '' ? null : Math.max(0, parseInt(b.securityDeposit, 10) || 0)); }
  if (b.extraFees !== undefined) { updates.push('extra_fees = $' + i++); values.push((b.extraFees != null && String(b.extraFees).trim()) ? String(b.extraFees).trim().slice(0, 500) : null); }
  if (b.advancePay !== undefined) { updates.push('advance_pay = $' + i++); values.push(b.advancePay == null || b.advancePay === '' ? null : Math.max(0, parseInt(b.advancePay, 10) || 0)); }
  if (b.brokerFee !== undefined) { updates.push('broker_fee = $' + i++); values.push(b.brokerFee == null || b.brokerFee === '' ? null : Math.max(0, parseInt(b.brokerFee, 10) || 0)); }
  if (b.associationFee !== undefined) { updates.push('association_fee = $' + i++); values.push(b.associationFee == null || b.associationFee === '' ? null : Math.max(0, parseInt(b.associationFee, 10) || 0)); }
  if (b.utilitiesIncluded !== undefined) { updates.push('utilities_included = $' + i++); values.push(!!b.utilitiesIncluded); }
  if (b.reservationFee !== undefined) { updates.push('reservation_fee = $' + i++); values.push(b.reservationFee == null || b.reservationFee === '' ? null : Math.max(0, parseInt(b.reservationFee, 10) || 0)); }
  if (b.furnished !== undefined) { updates.push('furnished = $' + i++); values.push((b.furnished != null && String(b.furnished).trim()) ? String(b.furnished).trim().slice(0, 50) : null); }
  if (b.sold !== undefined) { updates.push('sold = $' + i++); values.push(!!b.sold); }
  if (b.currentlyRented !== undefined) { updates.push('currently_rented = $' + i++); values.push(!!b.currentlyRented); }
  if (b.availableFrom !== undefined) { updates.push('available_from = $' + i++); values.push((b.availableFrom != null && String(b.availableFrom).trim()) ? String(b.availableFrom).trim().slice(0, 100) : null); }
  if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });
  values.push(id);
  await pool.query('UPDATE listings SET updated_at = now(), ' + updates.join(', ') + ' WHERE id = $' + i, values);
  const { rows } = await pool.query('SELECT ' + COLS + ' FROM listings WHERE id = $1', [id]);
  res.json(mapListingRow(rows[0]));
});

// Owner "delete" = unlist (soft). Listing stays in DB, hidden from feed; admins still see it.
router.delete('/:id', authMiddleware, async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const id = req.params.id;
  const { rows } = await pool.query('SELECT id, owner_id FROM listings WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Listing not found' });
  if (rows[0].owner_id !== req.user.id) return res.status(403).json({ error: 'Only the owner can unlist this listing' });
  await pool.query("UPDATE listings SET status = 'unlisted', updated_at = now() WHERE id = $1", [id]);
  const { rows: updated } = await pool.query('SELECT ' + COLS + ' FROM listings WHERE id = $1', [id]);
  res.status(200).json(mapListingRow(updated[0]));
});

// Report / flag listing (authenticated; non-owner only).
router.post('/:id/report', authMiddleware, async (req, res, next) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const listingId = parseInt(req.params.id, 10);
  if (Number.isNaN(listingId)) return res.status(400).json({ error: 'Invalid listing id' });
  const reason = (req.body && req.body.reason != null) ? String(req.body.reason).trim().slice(0, 2000) : null;
  try {
    const { rows: listing } = await pool.query('SELECT id, owner_id FROM listings WHERE id = $1', [listingId]);
    if (!listing[0]) return res.status(404).json({ error: 'Listing not found' });
    if (listing[0].owner_id === req.user.id) return res.status(400).json({ error: 'You cannot report your own listing' });
    const { rows: existing } = await pool.query(
      'SELECT id FROM listing_reports WHERE listing_id = $1 AND reporter_id = $2',
      [listingId, req.user.id]
    );
    if (existing[0]) return res.status(200).json({ ok: true, message: 'You have already reported this listing.' });
    await pool.query(
      'INSERT INTO listing_reports (listing_id, reporter_id, reason) VALUES ($1, $2, $3)',
      [listingId, req.user.id, reason]
    );
    return res.status(201).json({ ok: true, message: 'Report submitted. Thank you for helping keep the community safe.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
