-- Convert listing IDs from UUID to fixed 8-char hex IDs.
-- IMPORTANT: This runs only when listings.id is still UUID.
DO $$
DECLARE
  listings_id_is_uuid BOOLEAN := FALSE;
  fk_record RECORD;
BEGIN
  SELECT (a.atttypid = 'uuid'::regtype)
  INTO listings_id_is_uuid
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'listings'
    AND a.attname = 'id'
    AND a.attnum > 0
    AND NOT a.attisdropped;

  IF NOT COALESCE(listings_id_is_uuid, FALSE) THEN
    RAISE NOTICE 'Skipping switch-listing-id-to-hex8.sql: listings.id is not UUID anymore.';
    RETURN;
  END IF;

  -- User requested deleting existing properties before switching ID type.
  TRUNCATE TABLE public.listings CASCADE;

  -- Drop all FKs that currently reference listings(id).
  FOR fk_record IN
    SELECT conrelid::regclass::text AS table_name, conname
    FROM pg_constraint
    WHERE contype = 'f'
      AND confrelid = 'public.listings'::regclass
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', fk_record.table_name, fk_record.conname);
  END LOOP;

  -- Convert primary key type + default generator.
  ALTER TABLE public.listings
    ALTER COLUMN id DROP DEFAULT;

  ALTER TABLE public.listings
    ALTER COLUMN id TYPE CHAR(8)
    USING lower(substr(replace(id::text, '-', ''), 1, 8));

  ALTER TABLE public.listings
    ALTER COLUMN id SET DEFAULT lower(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  ALTER TABLE public.listings
    DROP CONSTRAINT IF EXISTS listings_id_hex8_check;

  ALTER TABLE public.listings
    ADD CONSTRAINT listings_id_hex8_check CHECK (id ~ '^[0-9a-f]{8}$');

  -- Convert foreign-key columns to match.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'favorites' AND column_name = 'listing_id'
  ) THEN
    ALTER TABLE public.favorites
      ALTER COLUMN listing_id TYPE CHAR(8)
      USING lower(substr(replace(listing_id::text, '-', ''), 1, 8));
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recently_viewed' AND column_name = 'listing_id'
  ) THEN
    ALTER TABLE public.recently_viewed
      ALTER COLUMN listing_id TYPE CHAR(8)
      USING lower(substr(replace(listing_id::text, '-', ''), 1, 8));
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'chat_threads' AND column_name = 'listing_id'
  ) THEN
    ALTER TABLE public.chat_threads
      ALTER COLUMN listing_id TYPE CHAR(8)
      USING lower(substr(replace(listing_id::text, '-', ''), 1, 8));
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'listing_reports' AND column_name = 'listing_id'
  ) THEN
    ALTER TABLE public.listing_reports
      ALTER COLUMN listing_id TYPE CHAR(8)
      USING lower(substr(replace(listing_id::text, '-', ''), 1, 8));
  END IF;

  -- Re-create foreign keys.
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'favorites'
  ) THEN
    ALTER TABLE public.favorites
      DROP CONSTRAINT IF EXISTS favorites_listing_id_fkey;
    ALTER TABLE public.favorites
      ADD CONSTRAINT favorites_listing_id_fkey
      FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'recently_viewed'
  ) THEN
    ALTER TABLE public.recently_viewed
      DROP CONSTRAINT IF EXISTS recently_viewed_listing_id_fkey;
    ALTER TABLE public.recently_viewed
      ADD CONSTRAINT recently_viewed_listing_id_fkey
      FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'chat_threads'
  ) THEN
    ALTER TABLE public.chat_threads
      DROP CONSTRAINT IF EXISTS chat_threads_listing_id_fkey;
    ALTER TABLE public.chat_threads
      ADD CONSTRAINT chat_threads_listing_id_fkey
      FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'listing_reports'
  ) THEN
    ALTER TABLE public.listing_reports
      DROP CONSTRAINT IF EXISTS listing_reports_listing_id_fkey;
    ALTER TABLE public.listing_reports
      ADD CONSTRAINT listing_reports_listing_id_fkey
      FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;
END $$;
