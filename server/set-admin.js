require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const email = process.argv[2] || 'khacey.salvador@gmail.com';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool
  .query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email])
  .then((r) => {
    console.log(r.rowCount ? `Updated: ${email} is now admin.` : `No user found with email: ${email}`);
    pool.end();
  })
  .catch((e) => {
    console.error(e.message);
    pool.end();
    process.exit(1);
  });
