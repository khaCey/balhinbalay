/**
 * Run schema.sql against the database in DATABASE_URL.
 * Usage: from project root, set .env then run: node server/run-schema.js
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

const schemaPath = path.join(__dirname, '..', 'schema.sql');
const sql = fs.readFileSync(schemaPath, 'utf8');

const pool = new Pool({ connectionString: DATABASE_URL });

pool.query(sql)
  .then(() => {
    console.log('Schema applied successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Schema error:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
