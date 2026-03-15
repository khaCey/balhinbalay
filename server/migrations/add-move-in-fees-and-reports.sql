-- Move-in fee fields and listing reports (report/flag)
-- Run: node server/run-migrations.js
ALTER TABLE listings ADD COLUMN IF NOT EXISTS advance_pay BIGINT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS broker_fee BIGINT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS association_fee BIGINT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS utilities_included BOOLEAN;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reservation_fee BIGINT;

CREATE TABLE IF NOT EXISTS listing_reports (
  id SERIAL PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_listing_reports_listing_id ON listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_reporter_id ON listing_reports(reporter_id);
