-- IDE0181 / WRK0049: immutable report submissions and separate admin history.
CREATE TABLE listing_reports (
 id UUID PRIMARY KEY,
 listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
 reported_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 reason TEXT NOT NULL CHECK (reason IN ('SUSPECTED_SCAM','INACCURATE_INFORMATION','UNAVAILABLE_PROPERTY','INAPPROPRIATE_CONTENT','OTHER')),
 details TEXT NOT NULL DEFAULT '' CHECK (char_length(details)<=2000),
 status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','UNDER_REVIEW','RESOLVED','DISMISSED')),
 version BIGINT NOT NULL DEFAULT 1 CHECK (version>0),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 resolved_at TIMESTAMPTZ,
 CHECK ((status IN ('RESOLVED','DISMISSED'))=(resolved_at IS NOT NULL))
);
CREATE UNIQUE INDEX listing_reports_one_open ON listing_reports(listing_id,reported_by_user_id) WHERE status IN ('NEW','UNDER_REVIEW');
CREATE INDEX listing_reports_queue ON listing_reports(status,id DESC);
CREATE TABLE listing_report_reviews (
 id UUID PRIMARY KEY,
 report_id UUID NOT NULL REFERENCES listing_reports(id) ON DELETE RESTRICT,
 reviewed_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 old_status TEXT NOT NULL,
 new_status TEXT NOT NULL,
 report_version BIGINT NOT NULL,
 note TEXT NOT NULL DEFAULT '' CHECK (char_length(note)<=2000),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(report_id,report_version),
 CHECK ((old_status='NEW' AND new_status='UNDER_REVIEW') OR (old_status='UNDER_REVIEW' AND new_status IN ('RESOLVED','DISMISSED')))
);
CREATE FUNCTION protect_listing_report() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Reports cannot be deleted'; END IF;
 IF (NEW.id,NEW.listing_id,NEW.reported_by_user_id,NEW.reason,NEW.details,NEW.created_at)
 IS DISTINCT FROM (OLD.id,OLD.listing_id,OLD.reported_by_user_id,OLD.reason,OLD.details,OLD.created_at)
 THEN RAISE EXCEPTION 'Report submissions are immutable'; END IF;
 IF NOT ((OLD.status='NEW' AND NEW.status='UNDER_REVIEW') OR (OLD.status='UNDER_REVIEW' AND NEW.status IN ('RESOLVED','DISMISSED')))
 OR NEW.version<>OLD.version+1 THEN RAISE EXCEPTION 'Invalid report transition'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_listing_report BEFORE UPDATE OR DELETE ON listing_reports FOR EACH ROW EXECUTE FUNCTION protect_listing_report();
CREATE FUNCTION protect_listing_report_review() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Report review history is immutable'; END $$;
CREATE TRIGGER protect_listing_report_review BEFORE UPDATE OR DELETE ON listing_report_reviews FOR EACH ROW EXECUTE FUNCTION protect_listing_report_review();
