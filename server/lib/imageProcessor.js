/**
 * Process listing images: convert data URLs to WebP and save to uploads/.
 * External URLs (http/https) are left as-is.
 */
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
const WEBP_QUALITY = 85;
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB per image

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Check if string is a data URL (base64 image).
 */
function isDataUrl(str) {
  return typeof str === 'string' && /^data:image\/\w+;base64,/.test(str);
}

/**
 * Convert data URL to WebP buffer using sharp.
 */
async function dataUrlToWebPBuffer(dataUrl) {
  const sharp = require('sharp');
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  return sharp(buffer)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/**
 * Process images array: convert data URLs to WebP files, return array of URLs.
 * Items that are already http/https URLs are passed through unchanged.
 * @param {string[]} images - Array of image URLs or data URLs
 * @param {string} basePath - Base URL path for saved images (e.g. '/uploads')
 * @returns {Promise<string[]>} Processed image URLs
 */
async function processImages(images) {
  if (!Array.isArray(images) || images.length === 0) return [];

  ensureUploadsDir();
  const result = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (typeof img !== 'string') continue;

    if (img.startsWith('http://') || img.startsWith('https://')) {
      result.push(img);
      continue;
    }

    if (!isDataUrl(img)) continue;

    const base64 = img.replace(/^data:image\/\w+;base64,/, '');
    const decodedSize = Math.ceil((base64.length * 3) / 4);
    if (decodedSize > MAX_FILE_BYTES) {
      console.warn('Image', i, 'exceeds 2MB limit, skipped');
      continue;
    }

    try {
      const webpBuffer = await dataUrlToWebPBuffer(img);
      const filename = `${randomUUID()}.webp`;
      const filepath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filepath, webpBuffer);
      result.push(`/uploads/${filename}`);
    } catch (err) {
      console.warn('Image conversion failed for item', i, err?.message || err);
      // Fallback: keep original if conversion fails (optional - or skip)
      // result.push(img); // would keep huge base64 - skip instead
    }
  }

  return result;
}

/**
 * Process multer file objects (memory buffers) to WebP and save.
 * @param {Array} files - Multer files array (each has .buffer, .mimetype, etc.)
 * @returns {Promise<string[]>} Processed image URLs
 */
async function processMulterFiles(files) {
  if (!Array.isArray(files) || files.length === 0) return [];

  const sharp = require('sharp');
  ensureUploadsDir();
  const result = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || !Buffer.isBuffer(file.buffer)) continue;
    if (file.buffer.length > MAX_FILE_BYTES) {
      console.warn('Image', i, 'exceeds 2MB limit, skipped');
      continue;
    }
    try {
      const webpBuffer = await sharp(file.buffer)
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      const filename = `${randomUUID()}.webp`;
      const filepath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filepath, webpBuffer);
      result.push(`/uploads/${filename}`);
    } catch (err) {
      console.warn('Image conversion failed for item', i, err?.message || err);
    }
  }

  return result;
}

module.exports = { processImages, processMulterFiles, ensureUploadsDir, UPLOADS_DIR };
