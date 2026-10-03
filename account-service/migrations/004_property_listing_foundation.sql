-- Private draft/first-submission foundation. No public activation, media or seed geography.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE regions (id uuid PRIMARY KEY, code text NOT NULL UNIQUE, name text NOT NULL);
CREATE TABLE provinces (id uuid PRIMARY KEY, region_id uuid NOT NULL REFERENCES regions ON DELETE RESTRICT, code text NOT NULL UNIQUE, name text NOT NULL);
CREATE TABLE cities (id uuid PRIMARY KEY, region_id uuid NOT NULL REFERENCES regions ON DELETE RESTRICT, province_id uuid REFERENCES provinces ON DELETE RESTRICT, code text NOT NULL UNIQUE, name text NOT NULL, locality_type text NOT NULL);
CREATE TABLE barangays (id uuid PRIMARY KEY, city_id uuid NOT NULL REFERENCES cities ON DELETE RESTRICT, code text NOT NULL UNIQUE, name text NOT NULL, UNIQUE(id,city_id));

CREATE TABLE developments (
 id uuid PRIMARY KEY, development_type text CHECK(development_type IN ('CONDOMINIUM','APARTMENT_BUILDING','BOARDING_HOUSE','DEVELOPMENT')),
 name text CHECK(length(name)<=200), city_id uuid REFERENCES cities ON DELETE RESTRICT, barangay_id uuid,
 managing_principal_id uuid REFERENCES principals ON DELETE RESTRICT, year_completed integer CHECK(year_completed BETWEEN 1 AND 9999), floor_count integer CHECK(floor_count>0),
 created_by_user_id uuid REFERENCES users(id) ON DELETE RESTRICT NOT NULL, version bigint NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz,
 FOREIGN KEY(barangay_id,city_id) REFERENCES barangays(id,city_id) ON DELETE RESTRICT,
 CHECK(barangay_id IS NULL OR city_id IS NOT NULL)
);
CREATE TABLE properties (
 id uuid PRIMARY KEY, property_type text CHECK(property_type IN ('CONDO','APARTMENT','HOUSE','TOWNHOUSE','ROOM','LAND')),
 development_id uuid REFERENCES developments ON DELETE RESTRICT, parent_property_id uuid REFERENCES properties ON DELETE RESTRICT,
 created_by_user_id uuid REFERENCES users(id) ON DELETE RESTRICT NOT NULL, city_id uuid REFERENCES cities ON DELETE RESTRICT, barangay_id uuid,
 bedrooms integer CHECK(bedrooms>=0), bathrooms integer CHECK(bathrooms>=0), parking_spaces integer CHECK(parking_spaces>=0),
 floor_area_sqm numeric(14,4) CHECK(floor_area_sqm>0), lot_area_sqm numeric(14,4) CHECK(lot_area_sqm>0),
 furnishing text CHECK(furnishing IN ('FURNISHED','SEMI_FURNISHED','UNFURNISHED')), version bigint NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz,
 FOREIGN KEY(barangay_id,city_id) REFERENCES barangays(id,city_id) ON DELETE RESTRICT,
 CHECK(barangay_id IS NULL OR city_id IS NOT NULL), CHECK(id<>parent_property_id),
 CHECK(property_type IS NULL OR property_type NOT IN ('CONDO','APARTMENT','ROOM') OR lot_area_sqm IS NULL),
 CHECK(property_type IS NULL OR property_type<>'LAND' OR (bedrooms IS NULL AND bathrooms IS NULL AND parking_spaces IS NULL AND floor_area_sqm IS NULL AND furnishing IS NULL)),
 CHECK(property_type IS NULL OR property_type<>'ROOM' OR (bedrooms IS NULL AND bathrooms IS NULL AND parking_spaces IS NULL)),
 CHECK(parent_property_id IS NULL OR property_type='ROOM')
);

CREATE TABLE condo_details (property_id uuid PRIMARY KEY REFERENCES properties ON DELETE CASCADE, floor_number integer);

CREATE TABLE apartment_details (property_id uuid PRIMARY KEY REFERENCES properties ON DELETE CASCADE, floor_number integer);

CREATE TABLE house_details (property_id uuid PRIMARY KEY REFERENCES properties ON DELETE CASCADE, storeys integer CHECK(storeys>0), year_built integer CHECK(year_built BETWEEN 1 AND 9999));

CREATE TABLE townhouse_details (property_id uuid PRIMARY KEY REFERENCES properties ON DELETE CASCADE, storeys integer CHECK(storeys>0), year_built integer CHECK(year_built BETWEEN 1 AND 9999));

CREATE TABLE room_details (property_id uuid PRIMARY KEY REFERENCES properties ON DELETE CASCADE, max_occupants integer CHECK(max_occupants>0), bathroom_access text CHECK(bathroom_access IN ('PRIVATE','SHARED','NONE')));

CREATE TABLE land_details (property_id uuid PRIMARY KEY REFERENCES properties ON DELETE CASCADE);

CREATE TABLE property_private_locations (
 property_id uuid PRIMARY KEY REFERENCES properties ON DELETE CASCADE,
 street_address text CHECK(length(street_address)<=500), unit_identifier text CHECK(length(unit_identifier)<=100), room_identifier text CHECK(length(room_identifier)<=100),
 exact_location geography(Point,4326), provenance text CHECK(length(provenance)<=100), version bigint NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX property_private_location_gix ON property_private_locations USING gist(exact_location);
CREATE TABLE property_authorities (
 id uuid PRIMARY KEY, property_id uuid NOT NULL REFERENCES properties ON DELETE RESTRICT, principal_id uuid NOT NULL REFERENCES principals ON DELETE RESTRICT,
 relationship text NOT NULL CHECK(relationship IN ('OWNER','AGENT_BROKER','PROPERTY_MANAGER','DEVELOPER_REPRESENTATIVE')),
 verification_state text NOT NULL DEFAULT 'declared' CHECK(verification_state IN ('declared','pending','verified','rejected')),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','revoked')),
 verified_by_user_id uuid REFERENCES users(id) ON DELETE RESTRICT, verified_at timestamptz, version bigint NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id,property_id,principal_id),
 CHECK(verification_state<>'verified' OR (verified_by_user_id IS NOT NULL AND verified_at IS NOT NULL))
);
CREATE INDEX property_authority_owner ON property_authorities(principal_id,property_id);
CREATE TABLE property_aliases (
 old_property_id uuid PRIMARY KEY REFERENCES properties ON DELETE RESTRICT, canonical_property_id uuid NOT NULL REFERENCES properties ON DELETE RESTRICT,
 merged_by_user_id uuid REFERENCES users(id) ON DELETE RESTRICT NOT NULL, merged_at timestamptz NOT NULL DEFAULT now(), CHECK(old_property_id<>canonical_property_id)
);
CREATE TABLE property_merge_events (
 id uuid PRIMARY KEY, old_property_id uuid NOT NULL REFERENCES properties ON DELETE RESTRICT, canonical_property_id uuid NOT NULL REFERENCES properties ON DELETE RESTRICT,
 acting_user_id uuid REFERENCES users(id) ON DELETE RESTRICT NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), reason text NOT NULL
);
CREATE TABLE features (code text PRIMARY KEY, label text NOT NULL, scope text NOT NULL CHECK(scope IN ('PROPERTY','DEVELOPMENT')), active boolean NOT NULL DEFAULT true);
CREATE TABLE property_features (property_id uuid REFERENCES properties ON DELETE CASCADE, feature_code text REFERENCES features ON DELETE RESTRICT, PRIMARY KEY(property_id,feature_code));
CREATE TABLE development_features (development_id uuid REFERENCES developments ON DELETE CASCADE, feature_code text REFERENCES features ON DELETE RESTRICT, PRIMARY KEY(development_id,feature_code));
CREATE TABLE listings (
 id uuid PRIMARY KEY, property_id uuid NOT NULL REFERENCES properties ON DELETE RESTRICT,
 owner_principal_id uuid NOT NULL REFERENCES principals ON DELETE RESTRICT, authority_id uuid NOT NULL,
 created_by_user_id uuid REFERENCES users(id) ON DELETE RESTRICT NOT NULL, responsible_lister_user_id uuid REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
 transaction_type text CHECK(transaction_type IN ('RENT','SALE')), title text CHECK(length(title)<=200), description text CHECK(length(description)<=4000),
 price_amount numeric(18,4) CHECK(price_amount>0), currency_code char(3) REFERENCES currencies ON DELETE RESTRICT,
 review_status text NOT NULL DEFAULT 'draft' CHECK(review_status IN ('draft','pending','approved','rejected')),
 market_status text NOT NULL DEFAULT 'unlisted' CHECK(market_status IN ('unlisted','active','rented','sold','archived')),
 availability_status text CHECK(availability_status IN ('AVAILABLE','OCCUPIED')), available_from date,
 published_at timestamptz, approved_submission_id uuid, public_map_point geography(Point,4326), location_confirmed_at timestamptz,
 version bigint NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz,
 FOREIGN KEY(authority_id,property_id,owner_principal_id) REFERENCES property_authorities(id,property_id,principal_id) ON DELETE RESTRICT,
 CHECK(market_status<>'active' OR (review_status='approved' AND approved_submission_id IS NOT NULL AND published_at IS NOT NULL)),
 CHECK(public_map_point IS NULL OR location_confirmed_at IS NOT NULL)
);
CREATE INDEX listings_owner_page ON listings(owner_principal_id,created_at DESC,id DESC);
CREATE INDEX listings_property ON listings(property_id);
CREATE INDEX listing_public_location_gix ON listings USING gist(public_map_point);
CREATE TABLE rental_terms (
 listing_id uuid PRIMARY KEY REFERENCES listings ON DELETE CASCADE,
 pricing_period text CHECK(pricing_period IN ('DAILY','WEEKLY','MONTHLY')), minimum_lease_months integer CHECK(minimum_lease_months>0),
 deposit numeric(18,4) CHECK(deposit>=0), advance numeric(18,4) CHECK(advance>=0), key_money numeric(18,4) CHECK(key_money>=0),
 broker_fee numeric(18,4) CHECK(broker_fee>=0), association_dues numeric(18,4) CHECK(association_dues>=0), reservation_fee numeric(18,4) CHECK(reservation_fee>=0), other_fee_amount numeric(18,4) CHECK(other_fee_amount>=0),
 other_fee_description text CHECK(length(other_fee_description)<=500), utilities_notes text CHECK(length(utilities_notes)<=500),
 offering_mode text CHECK(offering_mode IN ('PRIVATE_ROOM','BEDSPACE')), current_occupants integer CHECK(current_occupants>=0),
 pets_allowed boolean, cooking_allowed boolean, visitors_allowed boolean, utilities_included boolean, gender_restriction text
);
CREATE TABLE sale_terms (listing_id uuid PRIMARY KEY REFERENCES listings ON DELETE CASCADE, payment_notes text CHECK(length(payment_notes)<=1000));
CREATE TABLE listing_submissions (
 id uuid PRIMARY KEY, listing_id uuid NOT NULL REFERENCES listings ON DELETE RESTRICT,
 listing_version bigint NOT NULL CHECK(listing_version>0), property_version bigint NOT NULL CHECK(property_version>0),
 validation_policy_version text NOT NULL, payload jsonb NOT NULL,
 submitted_by_user_id uuid REFERENCES users(id) ON DELETE RESTRICT NOT NULL, submitted_at timestamptz NOT NULL DEFAULT now(),
 reviewer_user_id uuid REFERENCES users(id) ON DELETE RESTRICT, review_outcome text CHECK(review_outcome IN ('approved','rejected')), reviewed_at timestamptz,
 UNIQUE(id,listing_id), UNIQUE(listing_id,listing_version)
);
ALTER TABLE listings ADD CONSTRAINT approved_submission_matches_listing
 FOREIGN KEY(approved_submission_id,id) REFERENCES listing_submissions(id,listing_id) ON DELETE RESTRICT;
CREATE TABLE listing_status_history (
 id uuid PRIMARY KEY, listing_id uuid NOT NULL REFERENCES listings ON DELETE RESTRICT, acting_user_id uuid REFERENCES users(id) ON DELETE RESTRICT,
 old_review_status text, new_review_status text, old_market_status text, new_market_status text,
 old_availability_status text, new_availability_status text, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE listing_price_history (
 id uuid PRIMARY KEY, listing_id uuid NOT NULL REFERENCES listings ON DELETE RESTRICT, acting_user_id uuid REFERENCES users(id) ON DELETE RESTRICT,
 old_amount numeric(18,4), new_amount numeric(18,4), old_currency char(3) REFERENCES currencies, new_currency char(3) REFERENCES currencies,
 old_period text, new_period text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit_events (
 id uuid PRIMARY KEY, actor_user_id uuid REFERENCES users(id) ON DELETE RESTRICT, acting_principal_id uuid REFERENCES principals ON DELETE RESTRICT,
 entity_type text NOT NULL, entity_uuid uuid NOT NULL, action text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_actor ON audit_events(actor_user_id);

-- Deferred aggregate checks permit atomic type/extension and transaction/terms changes.
CREATE FUNCTION marketplace_check_property() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE pid uuid; p properties; n integer; match_count integer;
BEGIN
 IF TG_TABLE_NAME='properties' THEN pid:=COALESCE(NEW.id,OLD.id); ELSE pid:=COALESCE(NEW.property_id,OLD.property_id); END IF;
 SELECT * INTO p FROM properties WHERE id=pid;
 IF NOT FOUND THEN RETURN NULL; END IF;
 SELECT count(*), count(*) FILTER(WHERE type=p.property_type) INTO n,match_count FROM (
  SELECT 'CONDO' AS type FROM condo_details WHERE property_id=pid UNION ALL SELECT 'APARTMENT' FROM apartment_details WHERE property_id=pid
  UNION ALL SELECT 'HOUSE' FROM house_details WHERE property_id=pid UNION ALL SELECT 'TOWNHOUSE' FROM townhouse_details WHERE property_id=pid
  UNION ALL SELECT 'ROOM' FROM room_details WHERE property_id=pid UNION ALL SELECT 'LAND' FROM land_details WHERE property_id=pid
 ) d;
 IF (p.property_type IS NULL AND n<>0) OR (p.property_type IS NOT NULL AND (n<>1 OR match_count<>1)) THEN
  RAISE EXCEPTION 'Property extension mismatch' USING ERRCODE='23514';
 END IF;
 IF p.property_type IS NULL OR p.property_type NOT IN ('CONDO','APARTMENT','HOUSE','TOWNHOUSE') THEN
  IF EXISTS(SELECT 1 FROM properties WHERE parent_property_id=pid) THEN RAISE EXCEPTION 'Invalid room parent type change' USING ERRCODE='23514'; END IF;
 END IF;
 IF p.parent_property_id IS NOT NULL THEN
  IF NOT EXISTS(SELECT 1 FROM properties WHERE id=p.parent_property_id AND property_type IN ('CONDO','APARTMENT','HOUSE','TOWNHOUSE')) THEN
   RAISE EXCEPTION 'Invalid room parent' USING ERRCODE='23514';
  END IF;
  IF EXISTS(WITH RECURSIVE ancestors AS (
   SELECT id,parent_property_id FROM properties WHERE id=p.parent_property_id
   UNION SELECT q.id,q.parent_property_id FROM properties q JOIN ancestors a ON q.id=a.parent_property_id
  ) SELECT 1 FROM ancestors WHERE id=pid) THEN RAISE EXCEPTION 'Property cycle' USING ERRCODE='23514'; END IF;
 END IF;
 IF p.property_type IS DISTINCT FROM 'ROOM' AND EXISTS(SELECT 1 FROM rental_terms t JOIN listings l ON l.id=t.listing_id
    WHERE l.property_id=pid AND (t.offering_mode IS NOT NULL OR t.current_occupants IS NOT NULL)) THEN
  RAISE EXCEPTION 'Room terms on non-room property' USING ERRCODE='23514';
 END IF;
 IF EXISTS(SELECT 1 FROM rental_terms t JOIN listings l ON l.id=t.listing_id JOIN room_details r ON r.property_id=l.property_id
    WHERE l.property_id=pid AND t.current_occupants>r.max_occupants) THEN RAISE EXCEPTION 'Room occupancy exceeds capacity' USING ERRCODE='23514'; END IF;
 RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER properties_aggregate_check AFTER INSERT OR UPDATE OR DELETE ON properties DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_property();

CREATE CONSTRAINT TRIGGER condo_details_aggregate_check AFTER INSERT OR UPDATE OR DELETE ON condo_details DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_property();

CREATE CONSTRAINT TRIGGER apartment_details_aggregate_check AFTER INSERT OR UPDATE OR DELETE ON apartment_details DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_property();

CREATE CONSTRAINT TRIGGER house_details_aggregate_check AFTER INSERT OR UPDATE OR DELETE ON house_details DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_property();

CREATE CONSTRAINT TRIGGER townhouse_details_aggregate_check AFTER INSERT OR UPDATE OR DELETE ON townhouse_details DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_property();

CREATE CONSTRAINT TRIGGER room_details_aggregate_check AFTER INSERT OR UPDATE OR DELETE ON room_details DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_property();

CREATE CONSTRAINT TRIGGER land_details_aggregate_check AFTER INSERT OR UPDATE OR DELETE ON land_details DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_property();

CREATE FUNCTION marketplace_check_listing() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE lid uuid; l listings; p properties; rental boolean; sale boolean;
BEGIN
 IF TG_TABLE_NAME='listings' THEN lid:=COALESCE(NEW.id,OLD.id); ELSE lid:=COALESCE(NEW.listing_id,OLD.listing_id); END IF;
 SELECT * INTO l FROM listings WHERE id=lid;
 IF NOT FOUND THEN RETURN NULL; END IF;
 SELECT * INTO p FROM properties WHERE id=l.property_id;
 SELECT EXISTS(SELECT 1 FROM rental_terms WHERE listing_id=lid),EXISTS(SELECT 1 FROM sale_terms WHERE listing_id=lid) INTO rental,sale;
 IF (l.transaction_type IS NULL AND (rental OR sale)) OR (l.transaction_type='RENT' AND (NOT rental OR sale)) OR (l.transaction_type='SALE' AND (rental OR NOT sale)) THEN
  RAISE EXCEPTION 'Listing terms mismatch' USING ERRCODE='23514';
 END IF;
 IF EXISTS(SELECT 1 FROM rental_terms WHERE listing_id=lid AND (offering_mode IS NOT NULL OR current_occupants IS NOT NULL)) AND p.property_type IS DISTINCT FROM 'ROOM' THEN
  RAISE EXCEPTION 'Room terms on non-room' USING ERRCODE='23514';
 END IF;
 IF EXISTS(SELECT 1 FROM rental_terms t JOIN room_details r ON r.property_id=p.id WHERE t.listing_id=lid AND t.current_occupants>r.max_occupants) THEN
  RAISE EXCEPTION 'Room occupancy exceeds capacity' USING ERRCODE='23514';
 END IF;
 RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER listings_aggregate_check AFTER INSERT OR UPDATE OR DELETE ON listings DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_listing();

CREATE CONSTRAINT TRIGGER rental_terms_aggregate_check AFTER INSERT OR UPDATE OR DELETE ON rental_terms DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_listing();

CREATE CONSTRAINT TRIGGER sale_terms_aggregate_check AFTER INSERT OR UPDATE OR DELETE ON sale_terms DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_listing();

CREATE FUNCTION marketplace_check_alias() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF EXISTS(WITH RECURSIVE chain AS (
  SELECT canonical_property_id AS id FROM property_aliases WHERE old_property_id=NEW.old_property_id
  UNION SELECT a.canonical_property_id FROM property_aliases a JOIN chain c ON a.old_property_id=c.id
 ) SELECT 1 FROM chain WHERE id=NEW.old_property_id) THEN RAISE EXCEPTION 'Alias cycle' USING ERRCODE='23514'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER property_alias_no_cycles AFTER INSERT OR UPDATE ON property_aliases DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION marketplace_check_alias();
CREATE FUNCTION marketplace_feature_scope() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM features WHERE code=NEW.feature_code AND scope=CASE WHEN TG_TABLE_NAME='property_features' THEN 'PROPERTY' ELSE 'DEVELOPMENT' END) THEN
  RAISE EXCEPTION 'Feature scope mismatch' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER property_feature_scope BEFORE INSERT OR UPDATE ON property_features FOR EACH ROW EXECUTE FUNCTION marketplace_feature_scope();
CREATE TRIGGER development_feature_scope BEFORE INSERT OR UPDATE ON development_features FOR EACH ROW EXECUTE FUNCTION marketplace_feature_scope();
CREATE FUNCTION marketplace_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Immutable marketplace history' USING ERRCODE='23514'; END $$;

CREATE TRIGGER listing_submissions_immutable BEFORE UPDATE OR DELETE ON listing_submissions FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();

CREATE TRIGGER listing_status_history_immutable BEFORE UPDATE OR DELETE ON listing_status_history FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();

CREATE TRIGGER listing_price_history_immutable BEFORE UPDATE OR DELETE ON listing_price_history FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();

CREATE TRIGGER audit_events_immutable BEFORE UPDATE OR DELETE ON audit_events FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();

CREATE TRIGGER property_merge_events_immutable BEFORE UPDATE OR DELETE ON property_merge_events FOR EACH ROW EXECUTE FUNCTION marketplace_immutable();

-- Changing the declared subject/relationship cannot carry verified approval forward.
CREATE FUNCTION marketplace_authority_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF (NEW.property_id,NEW.principal_id,NEW.relationship) IS DISTINCT FROM (OLD.property_id,OLD.principal_id,OLD.relationship) AND NEW.verification_state='verified' THEN
  RAISE EXCEPTION 'Changed authority requires fresh approval' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER property_authority_change BEFORE UPDATE ON property_authorities FOR EACH ROW EXECUTE FUNCTION marketplace_authority_change();
