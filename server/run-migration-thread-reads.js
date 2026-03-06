/**
 * Add thread_reads table (read receipts for chat). Run on existing DBs that already have the main schema.
 * Usage: from project root, node server/run-migration-thread-reads.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.includes('YOUR_PASSWORD')) {
  console.error('Set DATABASE_URL in .env');
  process.exit(1);
}

const sqlPath = path.join(__dirname, 'migrations', 'add-thread-reads.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');
const pool = new Pool({ connectionString: DATABASE_URL });

pool.query(sql)
  .then(() => {
    console.log('Migration add-thread-reads applied.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration error:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
