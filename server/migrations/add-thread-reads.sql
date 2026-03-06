-- Run this on existing DBs to add read receipts: psql -d balhinbalay -f server/migrations/add-thread-reads.sql
CREATE TABLE IF NOT EXISTS thread_reads (
  thread_id  UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_thread_reads_user ON thread_reads (user_id);
