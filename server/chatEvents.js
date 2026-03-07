/**
 * In-memory SSE broadcaster for chat. Maps userId -> Set of response objects.
 * When a message is sent, notifyUser(recipientId, payload) pushes an event to that user's connections.
 */
const connections = new Map();

function subscribe(userId, res) {
  if (!connections.has(userId)) connections.set(userId, new Set());
  connections.get(userId).add(res);
  console.log('[chat/events] SSE subscribed user', userId, 'connections:', connections.get(userId).size);

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
  if (typeof res.flush === 'function') res.flush();
}

function flushRes(res) {
  if (typeof res.flush === 'function') res.flush();
}

function notifyUser(userId, payload) {
  const set = connections.get(userId);
  if (!set) {
    console.log('[chat/events] No SSE connection for user', userId, '(in-app notification skipped)');
    return;
  }
  console.log('[chat/events] Sending', payload.type || 'event', 'to user', userId);
  const msg = 'data: ' + JSON.stringify(payload) + '\n\n';
  for (const res of set) {
    try {
      res.write(msg);
      flushRes(res);
    } catch (err) {
      set.delete(res);
      if (set.size === 0) connections.delete(userId);
    }
  }
}

module.exports = { subscribe, notifyUser };
