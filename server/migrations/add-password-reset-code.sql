-- Password reset: 5-digit code sent to email
-- Run: node server/run-migrations.js (includes this file)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_code VARCHAR(5);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_password_reset_code ON users (password_reset_code) WHERE password_reset_code IS NOT NULL;
