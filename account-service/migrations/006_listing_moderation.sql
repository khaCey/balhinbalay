-- IDE0174: append-only decisions on immutable submissions. No publication.
-- Application-generated UUIDv7, as in migrations003–005.
CREATE TABLE listing_submission_reviews (
 id UUID PRIMARY KEY,
 submission_id UUID NOT NULL UNIQUE,
 listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
 reviewer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 outcome TEXT NOT NULL CHECK(outcome IN ('approved','rejected')),
 reason TEXT,
 listing_version BIGINT NOT NULL CHECK(listing_version > 0),
 reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(submission_id,listing_id) REFERENCES listing_submissions(id,listing_id) ON DELETE RESTRICT,
 CHECK((outcome='rejected' AND reason IS NOT NULL AND length(btrim(reason)) BETWEEN 1 AND 2000)
    OR (outcome='approved' AND reason IS NULL))
);
CREATE INDEX listing_submission_reviews_listing ON listing_submission_reviews(listing_id,reviewed_at,id);
CREATE TRIGGER listing_submission_reviews_immutable BEFORE UPDATE OR DELETE ON listing_submission_reviews
 FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();
-- Existing submission reviewer columns remain reserved/unmodified: their rows,
-- payloads and old immutable triggers must never be rewritten to record a review.
