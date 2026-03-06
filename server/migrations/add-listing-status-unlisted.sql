-- Add 'unlisted' as a valid listing status (admin can unlist instead of reject).
-- Run: node server/run-migrations.js (add this file to the list) or psql -d balhinbalay -f server/migrations/add-listing-status-unlisted.sql

ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'unlisted'));
