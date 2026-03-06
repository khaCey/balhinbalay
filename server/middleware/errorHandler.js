/**
 * Centralized error middleware. Use next(err) in routes to send consistent JSON and log.
 * err.status (e.g. 400, 403, 404, 500) and err.message are used for the response.
 */
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Server error';
  console.error('[error]', status, message, err.stack || err);
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
