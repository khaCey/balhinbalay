const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = 'http://localhost:5000';
  // buffer: false so SSE (/api/chat/events) streams through without buffering
  app.use('/api', createProxyMiddleware({ target, changeOrigin: true, buffer: false }));
  app.use('/uploads', createProxyMiddleware({ target, changeOrigin: true }));
};
