-- Email confirmation for registration
-- Run: node server/run-migrations.js (includes this file)
-- Existing users get email_verified=true for backward compatibility; new signups get false
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_expires TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_confirmation_token ON users (confirmation_token) WHERE confirmation_token IS NOT NULL;
