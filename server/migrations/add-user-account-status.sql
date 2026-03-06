-- Run on existing DBs: psql -d balhinbalay -f server/migrations/add-user-account-status.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned'));
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users (account_status);
