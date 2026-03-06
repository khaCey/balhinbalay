-- BalhinBalay database schema (PostgreSQL)
-- Use this with your REST API backend. Adjust types for MySQL/SQLite if needed.

-- ========== USERS ==========
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(254) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  name           VARCHAR(200),
  role           VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  account_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (LOWER(email));
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_account_status ON users (account_status);

-- ========== LISTINGS (properties) ==========
CREATE TABLE listings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID REFERENCES users(id) ON DELETE SET NULL,
  title               VARCHAR(500) NOT NULL,
  listing_type        VARCHAR(20) NOT NULL CHECK (listing_type IN ('sale', 'rent')),
  type                VARCHAR(50) NOT NULL,
  price               BIGINT NOT NULL,
  city_id             VARCHAR(50) NOT NULL,
  location            VARCHAR(500),
  beds                INT NOT NULL DEFAULT 0,
  baths               INT NOT NULL DEFAULT 0,
  size_sqm            INT NOT NULL DEFAULT 0,
  description         TEXT,
  images              JSONB DEFAULT '[]',
  coordinates         JSONB,
  contact_agent_name  VARCHAR(200),
  contact_phone       VARCHAR(50),
  contact_email       VARCHAR(254),
  date_posted         DATE NOT NULL DEFAULT CURRENT_DATE,
  status              VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'unlisted')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_owner ON listings (owner_id);
CREATE INDEX idx_listings_status ON listings (status);
CREATE INDEX idx_listings_listing_type ON listings (listing_type);
CREATE INDEX idx_listings_city ON listings (city_id);
CREATE INDEX idx_listings_date_posted ON listings (date_posted DESC);

-- ========== FAVORITES (user ↔ listing) ==========
CREATE TABLE favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites (user_id);
CREATE INDEX idx_favorites_listing ON favorites (listing_id);

-- ========== SAVED SEARCHES ==========
CREATE TABLE saved_searches (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                 VARCHAR(200) NOT NULL,
  listing_type         VARCHAR(20),
  property_type        VARCHAR(50),
  price_range_index    INT,
  selected_region      VARCHAR(50),
  selected_province   VARCHAR(100),
  selected_city        VARCHAR(50),
  search_query         VARCHAR(500),
  min_beds             INT,
  min_baths            INT,
  size_range_min       INT,
  size_range_max       INT,
  sort_by              VARCHAR(30),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_saved_searches_user ON saved_searches (user_id);

-- ========== RECENTLY VIEWED (optional; for server-side history) ==========
CREATE TABLE recently_viewed (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recently_viewed_user_time ON recently_viewed (user_id, viewed_at DESC);

-- ========== CHAT THREADS (one per user–listing pair) ==========
CREATE TABLE chat_threads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, user_id)
);

CREATE INDEX idx_chat_threads_listing ON chat_threads (listing_id);
CREATE INDEX idx_chat_threads_user ON chat_threads (user_id);

-- ========== CHAT MESSAGES ==========
CREATE TABLE chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_thread ON chat_messages (thread_id);

-- ========== THREAD READ RECEIPTS (for unread badge) ==========
CREATE TABLE thread_reads (
  thread_id  UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX idx_thread_reads_user ON thread_reads (user_id);
