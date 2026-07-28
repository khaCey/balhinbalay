/**
 * BalhinBalay – single app server
 * Serves the React build (static) + REST API. Run this on your Linux server.
 */
const path = require('path');
const fs = require('fs');
const { createHash } = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const BUILD_DIR = path.join(__dirname, '..', 'build');
const API_ONLY = !fs.existsSync(BUILD_DIR);
const SITE_URL = (process.env.SITE_URL || process.env.REACT_APP_SITE_URL || '').replace(/\/+$/, '');

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
const OG_CACHE_DIR = path.join(UPLOADS_DIR, 'og-cache');
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

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrlSetXml(entries) {
  const body = entries
    .map((entry) => {
      return [
        '<url>',
        `<loc>${escapeXml(entry.loc)}</loc>`,
        entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '',
        entry.changefreq ? `<changefreq>${escapeXml(entry.changefreq)}</changefreq>` : '',
        entry.priority ? `<priority>${escapeXml(entry.priority)}</priority>` : '',
        '</url>'
      ].join('');
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

function buildSitemapIndexXml(entries) {
  const body = entries
    .map((entry) => {
      return [
        '<sitemap>',
        `<loc>${escapeXml(entry.loc)}</loc>`,
        entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '',
        '</sitemap>'
      ].join('');
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

function getPublicBaseUrl(req) {
  if (SITE_URL) return SITE_URL;
  const protoHeader = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(protoHeader)
    ? protoHeader[0]
    : (protoHeader || req.protocol || 'https');
  const host = req.get('host');
  return `${protocol}://${host}`;
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toAbsoluteUrl(req, value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const base = getPublicBaseUrl(req);
  if (String(value).startsWith('/')) return `${base}${value}`;
  return `${base}/${String(value).replace(/^\/+/, '')}`;
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || ''));
}

function isWebpPath(value) {
  const cleanValue = String(value || '').split('?')[0].toLowerCase();
  return cleanValue.endsWith('.webp');
}

function inferJpgFromWebp(value) {
  return String(value || '').replace(/\.webp(\?.*)?$/i, '.jpg$1');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function resolveUploadsFilePath(srcPath) {
  const normalized = String(srcPath || '').trim();
  if (!normalized.startsWith('/uploads/')) return '';
  const relativePath = normalized.replace(/^\/uploads\//, '');
  const absolute = path.resolve(UPLOADS_DIR, relativePath);
  if (!absolute.startsWith(path.resolve(UPLOADS_DIR))) return '';
  return absolute;
}

function hasLocalFileForUploadsPath(srcPath) {
  const absolutePath = resolveUploadsFilePath(srcPath);
  return !!(absolutePath && fs.existsSync(absolutePath));
}

function buildOgImageProxyPath(src) {
  return `/og-image.jpg?src=${encodeURIComponent(String(src || ''))}`;
}

async function fetchRemoteImageBuffer(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'BalhinBalayOgImageBot/1.0' }
  });
  if (!response.ok) {
    throw new Error(`Remote image request failed: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (!buffer.length) throw new Error('Remote image response was empty');
  return buffer;
}

async function toJpgBuffer(imageBuffer) {
  const sharp = require('sharp');
  return sharp(imageBuffer).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}

function pickPropertyShareImage(req, images) {
  const fallbackImage = '/logo.png';
  const firstImage = (images || []).find((item) => typeof item === 'string' && item.trim());
  if (!firstImage) return toAbsoluteUrl(req, fallbackImage);

  const imageValue = String(firstImage).trim();
  if (!isWebpPath(imageValue)) return toAbsoluteUrl(req, imageValue);

  if (!isHttpUrl(imageValue) && imageValue.startsWith('/uploads/')) {
    const inferredJpg = inferJpgFromWebp(imageValue);
    if (hasLocalFileForUploadsPath(inferredJpg)) {
      return toAbsoluteUrl(req, inferredJpg);
    }
  }

  return toAbsoluteUrl(req, buildOgImageProxyPath(imageValue));
}

function parseImages(imagesField) {
  if (Array.isArray(imagesField)) return imagesField.filter(Boolean);
  if (imagesField && typeof imagesField === 'object') {
    return Array.isArray(imagesField) ? imagesField.filter(Boolean) : [];
  }
  if (typeof imagesField === 'string' && imagesField.trim()) {
    try {
      const parsed = JSON.parse(imagesField);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function upsertMetaTag(html, attrName, attrValue, content) {
  const safeContent = escapeHtmlAttr(content || '');
  const tag = `<meta ${attrName}="${attrValue}" content="${safeContent}" />`;
  const regex = new RegExp(`<meta[^>]*${attrName}=["']${escapeRegex(attrValue)}["'][^>]*>`, 'i');
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertLinkTag(html, rel, href) {
  const safeHref = escapeHtmlAttr(href || '');
  const tag = `<link rel="${rel}" href="${safeHref}" />`;
  const regex = new RegExp(`<link[^>]*rel=["']${escapeRegex(rel)}["'][^>]*>`, 'i');
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertTitleTag(html, title) {
  const safeTitle = escapeHtmlAttr(title || 'BalhinBalay');
  const tag = `<title>${safeTitle}</title>`;
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function buildPropertyMeta(row, req) {
  const baseUrl = getPublicBaseUrl(req);
  const propertyPath = `/property/${row?.id || ''}`;
  const url = `${baseUrl}${propertyPath}`;
  const isPublic =
    !!row &&
    row.status === 'approved' &&
    !(row.listing_type === 'sale' && row.sold === true) &&
    !(row.listing_type === 'rent' && row.currently_rented === true);

  const images = parseImages(row?.images);
  const firstImage = pickPropertyShareImage(req, images);
  const listingTypeLabel = row?.listing_type === 'rent' ? 'For Rent' : 'For Sale';
  const priceText = Number.isFinite(Number(row?.price)) ? `PHP ${Number(row.price).toLocaleString('en-PH')}` : '';
  const titleText = row?.title ? `${row.title} ${listingTypeLabel} | BalhinBalay` : 'Property Listing | BalhinBalay';
  const descriptionParts = [
    listingTypeLabel,
    row?.type || '',
    row?.location || row?.city_id || '',
    priceText
  ].filter(Boolean);
  const shortDetails = descriptionParts.join(' • ');
  const longDescription = String(row?.description || '').replace(/\s+/g, ' ').trim();
  const trimmedDescription = longDescription.length > 140 ? `${longDescription.slice(0, 137)}...` : longDescription;
  const descriptionText = isPublic
    ? [shortDetails, trimmedDescription].filter(Boolean).join('. ') || 'Browse this property listing on BalhinBalay.'
    : 'This property listing is unavailable.';

  return {
    isPublic,
    title: titleText,
    description: descriptionText,
    url,
    image: firstImage,
    robots: isPublic ? 'index, follow' : 'noindex, follow'
  };
}

app.get('/og-image.jpg', async (req, res) => {
  const src = String(req.query.src || '').trim();
  if (!src) {
    return res.redirect(302, '/logo.png');
  }

  try {
    ensureDir(OG_CACHE_DIR);
    const cacheKey = createHash('sha1').update(src).digest('hex');
    const cachedFilename = `${cacheKey}.jpg`;
    const cachedFilePath = path.join(OG_CACHE_DIR, cachedFilename);

    if (fs.existsSync(cachedFilePath)) {
      return res
        .set('Cache-Control', 'public, max-age=604800, s-maxage=604800')
        .type('image/jpeg')
        .sendFile(cachedFilePath);
    }

    let sourceBuffer = null;
    if (isHttpUrl(src)) {
      sourceBuffer = await fetchRemoteImageBuffer(src);
    } else if (src.startsWith('/uploads/')) {
      const localFilePath = resolveUploadsFilePath(src);
      if (!localFilePath || !fs.existsSync(localFilePath)) {
        return res.redirect(302, '/logo.png');
      }
      sourceBuffer = fs.readFileSync(localFilePath);
    } else {
      return res.redirect(302, '/logo.png');
    }

    const jpgBuffer = await toJpgBuffer(sourceBuffer);
    fs.writeFileSync(cachedFilePath, jpgBuffer);

    return res
      .set('Cache-Control', 'public, max-age=604800, s-maxage=604800')
      .type('image/jpeg')
      .send(jpgBuffer);
  } catch (error) {
    console.warn('OG image conversion failed:', error?.message || error);
    return res.redirect(302, '/logo.png');
  }
});

function injectPropertyMetaHtml(html, meta) {
  let nextHtml = html;
  nextHtml = upsertTitleTag(nextHtml, meta.title);
  nextHtml = upsertMetaTag(nextHtml, 'name', 'description', meta.description);
  nextHtml = upsertMetaTag(nextHtml, 'name', 'robots', meta.robots);
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:type', 'article');
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:site_name', 'BalhinBalay');
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:title', meta.title);
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:description', meta.description);
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:url', meta.url);
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:image', meta.image);
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:image:alt', meta.title);
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:card', 'summary_large_image');
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:title', meta.title);
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:description', meta.description);
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:image', meta.image);
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:image:alt', meta.title);
  nextHtml = upsertLinkTag(nextHtml, 'canonical', meta.url);
  return nextHtml;
}

app.get('/robots.txt', (req, res) => {
  const baseUrl = getPublicBaseUrl(req);
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /menu',
    'Disallow: /messages',
    'Disallow: /chat/',
    'Disallow: /profile',
    'Disallow: /settings',
    'Disallow: /add-property',
    'Disallow: /my-properties',
    'Disallow: /confirm-email',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`
  ];
  res.type('text/plain').send(lines.join('\n'));
});

app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = getPublicBaseUrl(req);
    const now = new Date().toISOString();
    const xml = buildSitemapIndexXml([
      { loc: `${baseUrl}/sitemaps/static.xml`, lastmod: now },
      { loc: `${baseUrl}/sitemaps/properties.xml`, lastmod: now }
    ]);
    res.header('Content-Type', 'application/xml; charset=utf-8').send(xml);
  } catch (err) {
    next(err);
  }
});

app.get('/sitemaps/static.xml', (req, res) => {
  const baseUrl = getPublicBaseUrl(req);
  const now = new Date().toISOString();
  const staticUrls = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/search', priority: '0.9', changefreq: 'daily' },
    { path: '/sale', priority: '0.9', changefreq: 'hourly' },
    { path: '/rent', priority: '0.9', changefreq: 'hourly' },
    { path: '/search/city', priority: '0.7', changefreq: 'weekly' },
    { path: '/search/keyword', priority: '0.7', changefreq: 'weekly' },
    { path: '/search/school', priority: '0.7', changefreq: 'weekly' }
  ];
  const xml = buildUrlSetXml(
    staticUrls.map((entry) => ({
      loc: `${baseUrl}${entry.path}`,
      lastmod: now,
      changefreq: entry.changefreq,
      priority: entry.priority
    }))
  );
  res.header('Content-Type', 'application/xml; charset=utf-8').send(xml);
});

app.get('/sitemaps/properties.xml', async (req, res, next) => {
  try {
    const baseUrl = getPublicBaseUrl(req);
    const now = new Date().toISOString();
    let rows = [];
    if (pool) {
      const query = await pool.query(
        "SELECT id, updated_at FROM listings WHERE status = 'approved' AND (listing_type <> 'sale' OR sold = false) AND (listing_type <> 'rent' OR currently_rented = false) ORDER BY updated_at DESC NULLS LAST LIMIT 5000"
      );
      rows = query.rows;
    }
    const xml = buildUrlSetXml(
      rows.map((row) => ({
        loc: `${baseUrl}/property/${row.id}`,
        lastmod: row.updated_at ? new Date(row.updated_at).toISOString() : now,
        changefreq: 'daily',
        priority: '0.8'
      }))
    );
    res.header('Content-Type', 'application/xml; charset=utf-8').send(xml);
  } catch (err) {
    next(err);
  }
});

// ----- Serve React build (static files + SPA fallback) -----
const indexPath = path.join(BUILD_DIR, 'index.html');
const hasIndex = fs.existsSync(indexPath);
if (!API_ONLY && hasIndex) {
  app.use(express.static(BUILD_DIR, { index: 'index.html' }));
  app.get('/property/:id', async (req, res, next) => {
    try {
      const propertyId = String(req.params.id || '').trim();
      let row = null;
      if (pool && propertyId) {
        const query = await pool.query(
          "SELECT id, title, listing_type, type, price, city_id, location, description, images, status, sold, currently_rented FROM listings WHERE id = $1 LIMIT 1",
          [propertyId]
        );
        row = query.rows[0] || null;
      }

      const htmlTemplate = fs.readFileSync(indexPath, 'utf8');
      const meta = buildPropertyMeta(row, req);
      const htmlWithMeta = injectPropertyMetaHtml(htmlTemplate, meta);
      res.status(200).type('html').send(htmlWithMeta);
    } catch (err) {
      next(err);
    }
  });
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
