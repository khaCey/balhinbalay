-- Add user preference to enable/disable push notifications. Server skips sending when false.
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN NOT NULL DEFAULT true;
