-- Initial payments (rent), furnished status, and sold/rented availability
ALTER TABLE listings ADD COLUMN IF NOT EXISTS key_money BIGINT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS security_deposit BIGINT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS extra_fees TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS furnished VARCHAR(50);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sold BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS currently_rented BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available_from TEXT;
