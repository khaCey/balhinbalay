/**
 * Set a user to admin by email (or part of email).
 * Usage: node server/set-admin.js [email]
 * Example: node server/set-admin.js khacey
 *          node server/set-admin.js khacey@example.com
 * If no arg, defaults to "khacey" (matches email containing khacey or exact "khacey").
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.includes('YOUR_PASSWORD')) {
  console.error('Set DATABASE_URL in .env');
  process.exit(1);
}

const search = process.argv[2] || 'khacey';

async function run() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    const res = await pool.query(
      `UPDATE users SET role = 'admin' WHERE LOWER(email) LIKE $1 OR LOWER(email) = $2 RETURNING id, email, role`,
      ['%' + search.toLowerCase() + '%', search.toLowerCase()]
    );
    if (res.rowCount === 0) {
      console.log('No user found matching:', search);
      process.exit(1);
    }
    console.log('Updated to admin:', res.rows[0].email);
    process.exit(0);
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
