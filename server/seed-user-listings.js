/**
 * Seed listings for a specific user (email@gmail.com).
 * Creates the user if missing, then adds sample properties under that account.
 * Usage: node server/seed-user-listings.js (from project root, with .env set)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.includes('YOUR_PASSWORD')) {
  console.error('Set DATABASE_URL in .env');
  process.exit(1);
}

const TARGET_EMAIL = 'email@gmail.com';

const SAMPLE_LISTINGS = [
  {
    title: 'Cozy 2BR House in Lahug',
    listing_type: 'sale',
    type: 'House',
    price: 4500000,
    city_id: 'cebu-city',
    location: 'Barangay Lahug',
    beds: 2,
    baths: 2,
    size_sqm: 110,
    description: 'Charming 2-bedroom house in a quiet Lahug neighborhood, near IT Park and schools.',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
    coordinates: { lat: 10.3157, lng: 123.8854 },
    contact_agent_name: 'Agent',
    contact_phone: '+63 917 000 0001',
    contact_email: TARGET_EMAIL,
    date_posted: '2024-02-15'
  },
  {
    title: 'Studio Condo for Rent Near Ayala',
    listing_type: 'rent',
    type: 'Condo',
    price: 15000,
    city_id: 'cebu-city',
    location: 'Barangay Apas',
    beds: 1,
    baths: 1,
    size_sqm: 28,
    description: 'Furnished studio unit walking distance to Ayala Mall and business districts.',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
    coordinates: { lat: 10.3200, lng: 123.8900 },
    contact_agent_name: 'Agent',
    contact_phone: '+63 917 000 0002',
    contact_email: TARGET_EMAIL,
    date_posted: '2024-02-18'
  },
  {
    title: '3BR Family Home in Talamban',
    listing_type: 'sale',
    type: 'House',
    price: 5200000,
    city_id: 'cebu-city',
    location: 'Barangay Talamban',
    beds: 3,
    baths: 2,
    size_sqm: 145,
    description: 'Spacious family home with garden, ideal for growing families. Near schools and hospitals.',
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
    coordinates: { lat: 10.3500, lng: 123.9000 },
    contact_agent_name: 'Agent',
    contact_phone: '+63 917 000 0003',
    contact_email: TARGET_EMAIL,
    date_posted: '2024-02-20'
  },
  {
    title: '1BR Apartment in Mandaue',
    listing_type: 'rent',
    type: 'Apartment',
    price: 10000,
    city_id: 'mandaue-city',
    location: 'Barangay Banilad',
    beds: 1,
    baths: 1,
    size_sqm: 38,
    description: 'Clean and modern 1-bedroom apartment. Perfect for professionals.',
    images: ['https://images.unsplash.com/photo-1507089947368-19c1da9775ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
    coordinates: { lat: 10.3333, lng: 123.9333 },
    contact_agent_name: 'Agent',
    contact_phone: '+63 917 000 0004',
    contact_email: TARGET_EMAIL,
    date_posted: '2024-02-22'
  },
  {
    title: 'Beachfront Lot in Lapu-Lapu',
    listing_type: 'sale',
    type: 'Land',
    price: 12000000,
    city_id: 'lapu-lapu-city',
    location: 'Barangay Maribago',
    beds: 0,
    baths: 0,
    size_sqm: 450,
    description: 'Prime beachfront land in Maribago. Ideal for resort or vacation home development.',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
    coordinates: { lat: 10.3103, lng: 123.9494 },
    contact_agent_name: 'Agent',
    contact_phone: '+63 917 000 0005',
    contact_email: TARGET_EMAIL,
    date_posted: '2024-02-25'
  }
];

const pool = new Pool({ connectionString: DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    let userResult = await client.query(
      'SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)',
      [TARGET_EMAIL]
    );

    if (userResult.rows.length === 0) {
      const hash = bcrypt.hashSync('password123', 10);
      await client.query(
        `INSERT INTO users (id, email, password_hash, name) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id`,
        [TARGET_EMAIL, hash, 'Test User']
      );
      userResult = await client.query(
        'SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)',
        [TARGET_EMAIL]
      );
      console.log('Created user:', TARGET_EMAIL, '(password: password123)');
    } else {
      console.log('Found existing user:', TARGET_EMAIL);
    }

    const userId = userResult.rows[0].id;

    const insertListing = `INSERT INTO listings (
      owner_id, title, listing_type, type, price, city_id, location, beds, baths, size_sqm,
      description, images, coordinates, contact_agent_name, contact_phone, contact_email,
      date_posted, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14, $15, $16, $17, 'approved')`;

    for (const l of SAMPLE_LISTINGS) {
      await client.query(insertListing, [
        userId,
        l.title,
        l.listing_type,
        l.type,
        l.price,
        l.city_id,
        l.location || '',
        l.beds || 0,
        l.baths || 0,
        l.size_sqm || 0,
        l.description || '',
        JSON.stringify(l.images || []),
        l.coordinates ? JSON.stringify(l.coordinates) : null,
        l.contact_agent_name || '',
        l.contact_phone || '',
        l.contact_email || '',
        l.date_posted || new Date().toISOString().slice(0, 10)
      ]);
    }

    console.log('Inserted', SAMPLE_LISTINGS.length, 'listings for', TARGET_EMAIL);
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
