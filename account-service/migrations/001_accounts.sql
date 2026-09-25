-- Account-only slice of dbdesign.md. No marketplace, Lister or organisation data.
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE CHECK (email = lower(btrim(email)) AND length(email) <= 254),
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','disabled')),
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status <> 'active' OR email_verified_at IS NOT NULL)
);

CREATE TABLE account_actions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify','reset')),
  token_hash CHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  invalidated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  CHECK (expires_at > created_at)
);
CREATE INDEX account_actions_live ON account_actions (user_id,purpose,created_at DESC)
  WHERE consumed_at IS NULL AND invalidated_at IS NULL;

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX auth_sessions_user_active ON auth_sessions (user_id,expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE auth_rate_limits (
  bucket_hash CHAR(64) PRIMARY KEY,
  count INTEGER NOT NULL CHECK (count > 0),
  window_start TIMESTAMPTZ NOT NULL
);
