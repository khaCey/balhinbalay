/**
 * In-memory SSE broadcaster for chat. Maps userId -> Set of response objects.
 * When a message is sent, notifyUser(recipientId, payload) pushes an event to that user's connections.
 */
const connections = new Map();

function subscribe(userId, res) {
  if (!connections.has(userId)) connections.set(userId, new Set());
  connections.get(userId).add(res);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const cleanup = () => {
    const set = connections.get(userId);
    if (set) {
      set.delete(res);
      if (set.size === 0) connections.delete(userId);
    }
  };

  res.on('close', cleanup);
  res.on('error', cleanup);

  res.write('data: ' + JSON.stringify({ type: 'connected' }) + '\n\n');
}

function notifyUser(userId, payload) {
  const set = connections.get(userId);
  if (!set) return;
  const msg = 'data: ' + JSON.stringify(payload) + '\n\n';
  for (const res of set) {
    try {
      res.write(msg);
    } catch (err) {
      set.delete(res);
      if (set.size === 0) connections.delete(userId);
    }
  }
}

module.exports = { subscribe, notifyUser };
