# Database setup (local or server)

Follow these steps once so the app can connect to PostgreSQL.

## 1. Install PostgreSQL

- **Windows:** Download and run the installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/). Remember the password you set for the `postgres` user.
- **Linux (e.g. Ubuntu):** `sudo apt install postgresql postgresql-contrib`

## 2. Create the database

**Option A – Command line (Linux or Windows with `psql` in PATH):**
```bash
# As postgres user (Linux: sudo -u postgres)
createdb balhinbalay
```

**Option B – pgAdmin:** Create a new database named `balhinbalay`.

## 3. Set your password in `.env`

Open `.env` in the project root and replace `YOUR_PASSWORD` with your PostgreSQL password:

```
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/balhinbalay
```

If your username is not `postgres`, change it in the URL. Port is `5432` by default.

## 4. Run the schema (create tables)

From the project root:

```bash
node server/run-schema.js
```

Or from the `server` folder:

```bash
cd server
npm run schema
```

You should see: `Schema applied successfully.`

## 5. Run migrations (existing databases)

If you already have tables and need to add new columns (listing status, user role, account status), run **one** of these from the project root:

**Option A – Node (uses DATABASE_URL from .env):**
```bash
node server/run-migrations.js
```

**Option B – psql:**
```bash
psql -d balhinbalay -f server/migrations/add-listing-status.sql
psql -d balhinbalay -f server/migrations/add-user-role.sql
psql -d balhinbalay -f server/migrations/add-user-account-status.sql
```

Then set one user as admin (e.g. by email): `UPDATE users SET role = 'admin' WHERE email = 'your@email.com';`

## 6. Start the app

```bash
node server/index.js
```

Then open `http://localhost:5000`. Check `http://localhost:5000/api/health` – you should see `"db": true`.
