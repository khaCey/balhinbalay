const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { subscribe, notifyUser } = require('../chatEvents');

const router = express.Router();
router.use(authMiddleware);

function getPool(req) {
  return req.app.get('pool');
}

// GET /api/chat/events — SSE stream; client keeps connection open and receives threads_updated on new messages
router.get('/events', (req, res) => {
  subscribe(req.user.id, res);
});

// GET /api/chat/threads — return threads where current user is inquirer OR listing owner; include unreadCount per thread
router.get('/threads', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.json([]);
  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.listing_id, t.user_id, t.created_at, t.updated_at,
              l.title AS listing_title, l.owner_id AS listing_owner_id,
              u.name AS inquirer_name,
              o.name AS owner_name,
              (SELECT COUNT(*)::int FROM chat_messages m
               LEFT JOIN thread_reads tr ON tr.thread_id = t.id AND tr.user_id = $1
               WHERE m.thread_id = t.id AND m.sender_id != $1
                 AND m.created_at > COALESCE(tr.read_at, '1970-01-01'::timestamptz)
              ) AS unread_count
       FROM chat_threads t
       JOIN listings l ON l.id = t.listing_id
       LEFT JOIN users u ON u.id = t.user_id
       LEFT JOIN users o ON o.id = l.owner_id
       WHERE t.user_id = $1 OR l.owner_id = $1
       ORDER BY t.updated_at DESC`,
      [req.user.id]
    );
    res.json(rows.map(r => {
      const isOwner = r.listing_owner_id === req.user.id;
      const otherName = isOwner ? (r.inquirer_name || 'Inquirer') : (r.owner_name || 'Owner');
      return {
        id: r.id,
        listingId: r.listing_id,
        userId: r.user_id,
        listingTitle: r.listing_title,
        listingOwnerId: r.listing_owner_id,
        otherParticipantName: otherName,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        unreadCount: r.unread_count != null ? r.unread_count : 0
      };
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/chat/threads/:threadId/messages — allow inquirer or listing owner
router.get('/threads/:threadId/messages', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { threadId } = req.params;
  try {
    const { rows: thread } = await pool.query(
      `SELECT t.id, t.user_id, l.owner_id AS listing_owner_id
       FROM chat_threads t
       JOIN listings l ON l.id = t.listing_id
       WHERE t.id = $1`,
      [threadId]
    );
    if (!thread[0]) return res.status(404).json({ error: 'Thread not found' });
    const isInquirer = thread[0].user_id === req.user.id;
    const isOwner = thread[0].listing_owner_id === req.user.id;
    if (!isInquirer && !isOwner) return res.status(403).json({ error: 'Not a participant' });
    const { rows } = await pool.query(
      'SELECT id, thread_id, sender_id, text, created_at FROM chat_messages WHERE thread_id = $1 ORDER BY created_at ASC',
      [threadId]
    );
    res.json(rows.map(r => ({
      id: r.id,
      threadId: r.thread_id,
      senderId: r.sender_id,
      text: r.text,
      createdAt: r.created_at
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/chat/threads — body: { listingId }
router.post('/threads', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const listingId = req.body && req.body.listingId;
  if (!listingId) return res.status(400).json({ error: 'listingId is required' });
  try {
    const { rows: existing } = await pool.query(
      `SELECT t.id, t.listing_id, t.user_id, t.created_at, t.updated_at, l.owner_id AS listing_owner_id, l.title AS listing_title
       FROM chat_threads t JOIN listings l ON l.id = t.listing_id
       WHERE t.listing_id = $1 AND t.user_id = $2`,
      [listingId, req.user.id]
    );
    if (existing[0]) {
      const e = existing[0];
      return res.status(201).json({
        id: e.id,
        listingId: e.listing_id,
        userId: e.user_id,
        listingOwnerId: e.listing_owner_id,
        listingTitle: e.listing_title,
        createdAt: e.created_at,
        updatedAt: e.updated_at
      });
    }
    const { rows } = await pool.query(
      `INSERT INTO chat_threads (listing_id, user_id) VALUES ($1, $2)
       RETURNING id, listing_id, user_id, created_at, updated_at`,
      [listingId, req.user.id]
    );
    const { rows: listingRow } = await pool.query(
      'SELECT owner_id, title FROM listings WHERE id = $1',
      [listingId]
    );
    const r = rows[0];
    const listing = listingRow[0];
    res.status(201).json({
      id: r.id,
      listingId: r.listing_id,
      userId: r.user_id,
      listingOwnerId: listing?.owner_id,
      listingTitle: listing?.title,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Listing not found' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/chat/threads/:threadId/messages — body: { text }; allow inquirer or listing owner
router.post('/threads/:threadId/messages', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { threadId } = req.params;
  const text = (req.body && req.body.text != null) ? String(req.body.text).trim() : '';
  if (!text) return res.status(400).json({ error: 'text is required' });
  try {
    const { rows: thread } = await pool.query(
      `SELECT t.id, t.user_id, l.owner_id AS listing_owner_id
       FROM chat_threads t
       JOIN listings l ON l.id = t.listing_id
       WHERE t.id = $1`,
      [threadId]
    );
    if (!thread[0]) return res.status(404).json({ error: 'Thread not found' });
    const isInquirer = thread[0].user_id === req.user.id;
    const isOwner = thread[0].listing_owner_id === req.user.id;
    if (!isInquirer && !isOwner) return res.status(403).json({ error: 'Not a participant' });
    const { rows } = await pool.query(
      'INSERT INTO chat_messages (thread_id, sender_id, text) VALUES ($1, $2, $3) RETURNING id, thread_id, sender_id, text, created_at',
      [threadId, req.user.id, text]
    );
    await pool.query('UPDATE chat_threads SET updated_at = now() WHERE id = $1', [threadId]);
    const r = rows[0];
    const recipientUserId = req.user.id === thread[0].user_id ? thread[0].listing_owner_id : thread[0].user_id;
    notifyUser(recipientUserId, { type: 'threads_updated', threadId });
    res.status(201).json({ id: r.id, threadId: r.thread_id, senderId: r.sender_id, text: r.text, createdAt: r.created_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/chat/threads/:threadId/read — mark thread as read by current user (read receipt)
router.post('/threads/:threadId/read', async (req, res) => {
  const pool = getPool(req);
  if (!pool) return res.status(503).json({ error: 'Database not available' });
  const { threadId } = req.params;
  try {
    const { rows: thread } = await pool.query(
      `SELECT t.id, t.user_id, l.owner_id AS listing_owner_id
       FROM chat_threads t
       JOIN listings l ON l.id = t.listing_id
       WHERE t.id = $1`,
      [threadId]
    );
    if (!thread[0]) return res.status(404).json({ error: 'Thread not found' });
    const isInquirer = thread[0].user_id === req.user.id;
    const isOwner = thread[0].listing_owner_id === req.user.id;
    if (!isInquirer && !isOwner) return res.status(403).json({ error: 'Not a participant' });
    await pool.query(
      `INSERT INTO thread_reads (thread_id, user_id, read_at) VALUES ($1, $2, now())
       ON CONFLICT (thread_id, user_id) DO UPDATE SET read_at = now()`,
      [threadId, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
