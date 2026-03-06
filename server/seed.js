/**
 * Seed the database with sample listings and optional test user.
 * Usage: node server/seed.js (from project root, with .env set)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.includes('YOUR_PASSWORD')) {
  console.error('Set DATABASE_URL in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

// Load sample listings from src/data/listings.js (extract the array)
function loadSampleListings() {
  const filePath = path.join(__dirname, '..', 'src', 'data', 'listings.js');
  const content = fs.readFileSync(filePath, 'utf8');
  const start = content.indexOf('export const sampleListings = [');
  if (start === -1) throw new Error('sampleListings not found');
  const arrayStart = content.indexOf('[', start);
  let depth = 1;
  let i = arrayStart + 1;
  while (depth > 0 && i < content.length) {
    if (content[i] === '[') depth++;
    else if (content[i] === ']') depth--;
    i++;
  }
  const arrayStr = content.slice(arrayStart, i);
  return eval('(' + arrayStr + ')');
}

function toDbRow(l) {
  return {
    title: l.title,
    listing_type: l.listingType,
    type: l.type,
    price: l.price,
    city_id: l.cityId,
    location: l.location || '',
    beds: l.beds || 0,
    baths: l.baths || 0,
    size_sqm: l.sizeSqm || 0,
    description: l.description || '',
    images: JSON.stringify(Array.isArray(l.images) ? l.images : []),
    coordinates: l.coordinates ? JSON.stringify(l.coordinates) : null,
    contact_agent_name: l.contactInfo?.agentName || '',
    contact_phone: l.contactInfo?.phone || '',
    contact_email: l.contactInfo?.email || '',
    date_posted: l.datePosted || new Date().toISOString().slice(0, 10),
  };
}

async function seed() {
  const client = await pool.connect();
  try {
    const listings = loadSampleListings();
    const insertListing = `INSERT INTO listings (
      owner_id, title, listing_type, type, price, city_id, location, beds, baths, size_sqm,
      description, images, coordinates, contact_agent_name, contact_phone, contact_email, date_posted
    ) VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13, $14, $15, $16)`;
    const countRes = await client.query('SELECT COUNT(*) FROM listings');
    const count = parseInt(countRes.rows[0].count, 10);
    if (count > 0) {
      console.log('Listings already seeded (' + count + ' rows). Skipping.');
    } else {
      for (const l of listings) {
        const r = toDbRow(l);
        await client.query(insertListing, [
          r.title, r.listing_type, r.type, r.price, r.city_id, r.location,
          r.beds, r.baths, r.size_sqm, r.description, r.images, r.coordinates,
          r.contact_agent_name, r.contact_phone, r.contact_email, r.date_posted
        ]);
      }
      console.log('Inserted ' + listings.length + ' sample listings.');
    }

    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count, 10) === 0) {
      const hash = bcrypt.hashSync('password123', 10);
      await client.query(
        `INSERT INTO users (id, email, password_hash, name) VALUES (gen_random_uuid(), $1, $2, $3)`,
        ['test@example.com', hash, 'Test User']
      );
      console.log('Inserted test user: test@example.com / password123');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
