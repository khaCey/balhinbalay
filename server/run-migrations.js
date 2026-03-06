/**
 * Run all migrations in order to add missing columns to an existing database.
 * Usage: from project root, set .env then run: node server/run-migrations.js
 * Requires: DATABASE_URL in .env
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.includes('YOUR_PASSWORD')) {
  console.error('Set DATABASE_URL in .env (and replace YOUR_PASSWORD with your PostgreSQL password).');
  process.exit(1);
}

const migrations = [
  'add-listing-status.sql',
  'add-user-role.sql',
  'add-user-account-status.sql',
  'add-listing-status-unlisted.sql'
];

const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  for (const name of migrations) {
    const filePath = path.join(__dirname, 'migrations', name);
    if (!fs.existsSync(filePath)) {
      console.warn('Skip (not found):', name);
      continue;
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    // Remove comment lines for execution
    const statements = sql
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n');
    try {
      await pool.query(statements);
      console.log('Applied:', name);
    } catch (err) {
      console.error('Migration failed:', name, err.message);
      await pool.end();
      process.exit(1);
    }
  }
  await pool.end();
  console.log('All migrations applied.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
