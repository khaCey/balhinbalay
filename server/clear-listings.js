/**
 * Remove all listings from the database.
 * Dependent rows (favorites, recently_viewed, chat_threads/messages) are removed by FK CASCADE.
 * Usage: node server/clear-listings.js (from project root, with .env set)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.includes('YOUR_PASSWORD')) {
  console.error('Set DATABASE_URL in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  try {
    const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS n FROM listings');
    const before = countRows[0]?.n ?? 0;
    const { rowCount } = await pool.query('DELETE FROM listings');
    console.log('Found', before, 'listing(s). Deleted', rowCount, 'listing(s).');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
