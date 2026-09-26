-- Purpose-bind authentication sessions so ordinary credentials cannot be replayed as admin sessions.
-- Existing rows were created by the ordinary account flow, so they safely migrate to purpose='user'.
ALTER TABLE auth_sessions
  ADD COLUMN purpose TEXT NOT NULL DEFAULT 'user';

ALTER TABLE auth_sessions
  ADD CONSTRAINT auth_sessions_purpose_check CHECK (purpose IN ('user','admin'));

CREATE INDEX auth_sessions_user_purpose_active
  ON auth_sessions (user_id,purpose,expires_at)
  WHERE revoked_at IS NULL;
