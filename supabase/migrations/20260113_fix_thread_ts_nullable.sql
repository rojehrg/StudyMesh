-- Fix thread_ts to be nullable
-- Locks can be created without a thread context (e.g., from slash command without thread)

ALTER TABLE momentum_locks
  ALTER COLUMN thread_ts DROP NOT NULL;

-- Update comment
COMMENT ON COLUMN momentum_locks.thread_ts IS 'Optional: Thread timestamp if lock was created from a thread context';
