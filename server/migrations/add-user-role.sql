-- Run on existing DBs: psql -d balhinbalay -f server/migrations/add-user-role.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
