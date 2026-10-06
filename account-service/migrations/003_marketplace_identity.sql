-- Development foundation only. No Lister grants or geography/demo data.
-- The migration runner backfills principals with application-generated UUIDv7
-- in this same transaction; account creation uses the same identity helper.
ALTER TABLE users ADD COLUMN deletion_requested_at timestamptz,
  ADD COLUMN deleted_at timestamptz, ADD COLUMN anonymised_at timestamptz;

CREATE TABLE currencies (
  code char(3) PRIMARY KEY,
  minor_units smallint NOT NULL CHECK (minor_units BETWEEN 0 AND 4)
);
INSERT INTO currencies VALUES ('PHP',2);
CREATE TABLE organisations (
  id uuid PRIMARY KEY, name text CHECK(length(name)<=200),
  status text NOT NULL DEFAULT 'inactive' CHECK(status IN ('active','inactive','archived')),
  archived_at timestamptz, version bigint NOT NULL DEFAULT 1 CHECK(version>0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE organisation_memberships (
  organisation_id uuid REFERENCES organisations ON DELETE RESTRICT,
  user_id uuid REFERENCES users ON DELETE RESTRICT,
  role text NOT NULL CHECK(role IN ('OWNER','ADMIN','MEMBER')),
  status text NOT NULL DEFAULT 'inactive' CHECK(status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(organisation_id,user_id)
);
CREATE TABLE permissions (code text PRIMARY KEY, description text NOT NULL);
CREATE TABLE organisation_membership_permissions (
  organisation_id uuid NOT NULL, user_id uuid NOT NULL,
  permission_code text REFERENCES permissions ON DELETE RESTRICT,
  PRIMARY KEY(organisation_id,user_id,permission_code),
  FOREIGN KEY(organisation_id,user_id) REFERENCES organisation_memberships ON DELETE RESTRICT
);
CREATE TABLE principals (
  id uuid PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('USER','ORGANISATION')),
  user_id uuid UNIQUE REFERENCES users ON DELETE RESTRICT,
  organisation_id uuid UNIQUE REFERENCES organisations ON DELETE RESTRICT,
  archived_at timestamptz,
  CHECK((kind='USER' AND user_id IS NOT NULL AND organisation_id IS NULL)
     OR (kind='ORGANISATION' AND organisation_id IS NOT NULL AND user_id IS NULL))
);
CREATE TABLE lister_access (
  user_id uuid PRIMARY KEY REFERENCES users ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','suspended','revoked')),
  requested_at timestamptz NOT NULL DEFAULT now(), activated_at timestamptz,
  suspended_at timestamptz, revoked_at timestamptz,
  activated_by_user_id uuid REFERENCES users ON DELETE RESTRICT,
  version bigint NOT NULL DEFAULT 1 CHECK(version>0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(status<>'active' OR (activated_at IS NOT NULL AND activated_by_user_id IS NOT NULL))
);
