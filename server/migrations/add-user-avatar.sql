-- Add avatar_url to users for profile picture (URL to uploaded image, e.g. /uploads/xxx.webp)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
