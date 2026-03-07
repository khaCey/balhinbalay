/**
 * BalhinBalay – single app server
 * Serves the React build (static) + REST API. Run this on your Linux server.
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const BUILD_DIR = path.join(__dirname, '..', 'build');
const API_ONLY = !fs.existsSync(BUILD_DIR);

// Optional: DB pool (set DATABASE_URL to enable)
let pool = null;
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
}
app.set('pool', pool);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin.startsWith('capacitor://') || origin.startsWith('http://localhost') || origin.startsWith('http://10.0.2.2') || origin.startsWith('file://')) return cb(null, true);
    return cb(null, true);
  }
}));
app.use(express.json({ limit: '15mb' }));

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// ----- API routes (mount at /api so frontend can proxy or use same origin) -----
const { getMessaging } = require('./services/push');

app.get('/api/health', (req, res) => {
  res.status(200).contentType('application/json').json({
    ok: true,
    db: !!pool,
    push: !!getMessaging()
  });
});
app.get('/api', (req, res) => {
  res.status(200).contentType('application/json').json({ message: 'BalhinBalay API', health: '/api/health' });
});

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const listingsRoutes = require('./routes/listings');
const favoritesRoutes = require('./routes/favorites');
const savedSearchesRoutes = require('./routes/savedSearches');
const recentViewedRoutes = require('./routes/recentViewed');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/saved-searches', savedSearchesRoutes);
app.use('/api/recently-viewed', recentViewedRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// ----- Serve React build (static files + SPA fallback) -----
const indexPath = path.join(BUILD_DIR, 'index.html');
const hasIndex = fs.existsSync(indexPath);
if (!API_ONLY && hasIndex) {
  app.use(express.static(BUILD_DIR, { index: 'index.html' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/static')) return next();
    res.sendFile(indexPath, (err) => {
      if (err) next(err);
    });
  });
} else {
  app.get('/', (req, res) => res.json({ message: 'API-only mode. Run "npm run build" for static serve, or use React dev server on port 3000.' }));
}

app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`BalhinBalay server running on port ${PORT}`);
  if (API_ONLY) {
    console.log('  Mode:   API-only (no build folder; run "npm run build" for full server)');
  } else {
    console.log(`  Static: ${BUILD_DIR}`);
  }
  console.log(`  API:    http://localhost:${PORT}/api`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  if (!pool) console.log('  DB:     not configured (set DATABASE_URL to enable)');
  console.log('  [push] checking FCM...');
  if (getMessaging()) console.log('  Push:   FCM enabled');
  else console.log('  Push:   disabled (see [push] message above if GOOGLE_APPLICATION_CREDENTIALS is set)');
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a different number.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
