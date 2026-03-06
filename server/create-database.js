/**
 * Create the balhinbalay database if it doesn't exist.
 * Uses DATABASE_URL from .env but connects to the default 'postgres' DB first.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

const url = process.env.DATABASE_URL;
if (!url || !url.includes('postgresql')) {
  console.error('Set DATABASE_URL in .env (e.g. postgresql://postgres:YOUR_PASSWORD@localhost:5432/balhinbalay)');
  process.exit(1);
}

// Connect to default 'postgres' database to run CREATE DATABASE
const defaultUrl = url.replace(/\/[^/]*$/, '/postgres');
const client = new Client({ connectionString: defaultUrl });

client.connect()
  .then(() => client.query("SELECT 1 FROM pg_database WHERE datname = 'balhinbalay'"))
  .then((res) => {
    if (res.rows.length > 0) {
      console.log('Database balhinbalay already exists.');
      return;
    }
    return client.query('CREATE DATABASE balhinbalay');
  })
  .then((result) => {
    if (result) console.log('Database balhinbalay created.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  })
  .finally(() => client.end());
