-- Momentum Locks - Timezone-aware work handoff system
-- Prevents work from stalling across sleep cycles

-- Momentum Locks table
CREATE TABLE IF NOT EXISTS momentum_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL,              -- Slack team ID
  channel_id TEXT NOT NULL,
  thread_ts TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL,        -- Slack user who created the lock
  requester_user_id TEXT NOT NULL,         -- Who needs the outcome
  owner_user_id TEXT NOT NULL,             -- Who must deliver
  fallback_user_id TEXT,                   -- Backup person (optional)
  required_outcome TEXT NOT NULL,          -- One sentence describing what's needed
  acceptable_fallback TEXT,                -- Fallback outcome if blocked
  impact_statement TEXT,                   -- Why it matters
  deadline_at TIMESTAMPTZ NOT NULL,
  owner_timezone TEXT,
  requester_timezone TEXT,
  status TEXT NOT NULL DEFAULT 'draft',    -- draft, active, started, blocked, done, canceled, expired
  escalation_sent_at TIMESTAMPTZ,
  wake_up_delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_momentum_locks_workspace ON momentum_locks(workspace_id);
CREATE INDEX idx_momentum_locks_owner ON momentum_locks(owner_user_id);
CREATE INDEX idx_momentum_locks_fallback ON momentum_locks(fallback_user_id);
CREATE INDEX idx_momentum_locks_status ON momentum_locks(status);
CREATE INDEX idx_momentum_locks_deadline ON momentum_locks(deadline_at);
CREATE INDEX idx_momentum_locks_created ON momentum_locks(created_at DESC);

-- Composite index for cron job queries (find active locks needing delivery)
CREATE INDEX idx_momentum_locks_delivery ON momentum_locks(status, wake_up_delivered_at, deadline_at)
  WHERE status = 'active' AND wake_up_delivered_at IS NULL;

-- Momentum Lock Events table - tracks all state transitions
CREATE TABLE IF NOT EXISTS momentum_lock_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lock_id UUID NOT NULL REFERENCES momentum_locks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,  -- created, confirmed, delivered, started, blocked, done, escalated, reassigned, expired, canceled
  actor_user_id TEXT,        -- Slack user who triggered the event (null for system events)
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_momentum_lock_events_lock ON momentum_lock_events(lock_id);
CREATE INDEX idx_momentum_lock_events_type ON momentum_lock_events(event_type);
CREATE INDEX idx_momentum_lock_events_created ON momentum_lock_events(created_at DESC);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_momentum_locks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER momentum_locks_updated_at
  BEFORE UPDATE ON momentum_locks
  FOR EACH ROW
  EXECUTE FUNCTION update_momentum_locks_updated_at();

-- Comments for documentation
COMMENT ON TABLE momentum_locks IS 'Lightweight contracts for timezone-aware work handoffs';
COMMENT ON COLUMN momentum_locks.status IS 'Lifecycle: draft → active → started|blocked|done|canceled|expired';
COMMENT ON COLUMN momentum_locks.wake_up_delivered_at IS 'When the owner received the wake-up DM';
COMMENT ON COLUMN momentum_locks.escalation_sent_at IS 'When fallback was notified';
