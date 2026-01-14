-- Migration: Add momentum_locks and momentum_lock_events tables

CREATE TABLE IF NOT EXISTS "momentum_locks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" text NOT NULL,
  "channel_id" text NOT NULL,
  "thread_ts" text,
  "created_by_user_id" text NOT NULL,
  "requester_user_id" text NOT NULL,
  "owner_user_id" text NOT NULL,
  "fallback_user_id" text,
  "required_outcome" text NOT NULL,
  "acceptable_fallback" text,
  "impact_statement" text,
  "deadline_at" timestamp with time zone NOT NULL,
  "owner_timezone" text,
  "requester_timezone" text,
  "status" text NOT NULL DEFAULT 'draft',
  "escalation_sent_at" timestamp with time zone,
  "wake_up_delivered_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "momentum_lock_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "lock_id" uuid NOT NULL REFERENCES "momentum_locks"("id") ON DELETE CASCADE,
  "event_type" text NOT NULL,
  "actor_user_id" text,
  "payload" jsonb DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "idx_momentum_locks_workspace" ON "momentum_locks" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_momentum_locks_owner" ON "momentum_locks" ("owner_user_id");
CREATE INDEX IF NOT EXISTS "idx_momentum_locks_status" ON "momentum_locks" ("status");
CREATE INDEX IF NOT EXISTS "idx_momentum_lock_events_lock" ON "momentum_lock_events" ("lock_id");
