-- IDE0099 / IDE0195. 007 is reserved for the independent reporting candidate.
-- Image bytes are private filesystem objects; no originals or paths in public DTOs.
CREATE TABLE media_assets (
 id UUID PRIMARY KEY,
 owner_principal_id UUID NOT NULL REFERENCES principals(id) ON DELETE RESTRICT,
 created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 media_type TEXT NOT NULL CHECK(media_type='IMAGE'),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE media_variants (
 asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
 variant TEXT NOT NULL CHECK(variant IN ('gallery','thumb','share')),
 mime_type TEXT NOT NULL CHECK((variant='share' AND mime_type='image/jpeg') OR (variant IN ('gallery','thumb') AND mime_type='image/webp')),
 width INTEGER NOT NULL CHECK(width BETWEEN 1 AND 2000),
 height INTEGER NOT NULL CHECK(height BETWEEN 1 AND 2000),
 byte_length INTEGER NOT NULL CHECK(byte_length BETWEEN 1 AND 8388608),
 sha256 TEXT NOT NULL CHECK(sha256 ~ '^[0-9a-f]{64}$'),
 PRIMARY KEY(asset_id,variant)
);
CREATE TABLE listing_media (
 listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
 asset_id UUID NOT NULL UNIQUE REFERENCES media_assets(id) ON DELETE RESTRICT,
 position INTEGER,
 removed_at TIMESTAMPTZ,
 PRIMARY KEY(listing_id,asset_id),
 UNIQUE(listing_id,position) DEFERRABLE INITIALLY DEFERRED,
 CHECK((removed_at IS NULL AND position IS NOT NULL AND position BETWEEN 0 AND 19) OR (removed_at IS NOT NULL AND position IS NULL))
);
CREATE TABLE listing_submission_media (
 submission_id UUID NOT NULL,
 listing_id UUID NOT NULL,
 asset_id UUID NOT NULL,
 position INTEGER NOT NULL CHECK(position BETWEEN 0 AND 19),
 PRIMARY KEY(submission_id,asset_id),
 UNIQUE(submission_id,position),
 FOREIGN KEY(submission_id,listing_id) REFERENCES listing_submissions(id,listing_id) ON DELETE RESTRICT,
 FOREIGN KEY(listing_id,asset_id) REFERENCES listing_media(listing_id,asset_id) ON DELETE RESTRICT
);
CREATE TRIGGER media_assets_immutable BEFORE UPDATE OR DELETE ON media_assets
 FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();
CREATE TRIGGER media_variants_immutable BEFORE UPDATE OR DELETE ON media_variants
 FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();
CREATE TRIGGER listing_submission_media_immutable BEFORE UPDATE OR DELETE ON listing_submission_media
 FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();
CREATE FUNCTION guard_listing_media() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Media history is retained'; END IF;
 IF TG_OP='UPDATE' AND (NEW.listing_id<>OLD.listing_id OR NEW.asset_id<>OLD.asset_id) THEN
  RAISE EXCEPTION 'Media attachment identity is immutable';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM listings l JOIN media_assets a ON a.owner_principal_id=l.owner_principal_id
  WHERE l.id=NEW.listing_id AND a.id=NEW.asset_id AND l.review_status IN ('draft','rejected')
  AND l.market_status='unlisted' AND l.archived_at IS NULL) THEN
  RAISE EXCEPTION 'Only owned private draft media may change';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_listing_media BEFORE INSERT OR UPDATE OR DELETE ON listing_media
 FOR EACH ROW EXECUTE FUNCTION guard_listing_media();
CREATE FUNCTION guard_submitted_media() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM listing_submissions s JOIN listings l ON l.id=s.listing_id
  JOIN listing_media m ON m.listing_id=l.id AND m.asset_id=NEW.asset_id AND m.removed_at IS NULL AND m.position=NEW.position
  WHERE s.id=NEW.submission_id AND s.listing_id=NEW.listing_id AND s.listing_version=l.version
  AND l.review_status='draft' AND l.market_status='unlisted' AND l.archived_at IS NULL
  AND NOT EXISTS(SELECT 1 FROM listing_submission_reviews r WHERE r.submission_id=s.id)
  AND (SELECT count(*) FROM media_variants v WHERE v.asset_id=m.asset_id)=3) THEN
  RAISE EXCEPTION 'Media must belong to the current unreviewed submission';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_submitted_media BEFORE INSERT ON listing_submission_media
 FOR EACH ROW EXECUTE FUNCTION guard_submitted_media();
