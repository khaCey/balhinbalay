-- Run on existing DBs: psql -d balhinbalay -f server/migrations/add-listing-status.sql
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
UPDATE listings SET status = 'approved' WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings (status);
