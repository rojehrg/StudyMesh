-- Add trial system columns to organizations table
-- 14-day free trial without credit card

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS trial_plan text,
ADD COLUMN IF NOT EXISTS trial_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

-- Add comment for documentation
COMMENT ON COLUMN organizations.trial_plan IS 'The plan being trialed (starter or pro)';
COMMENT ON COLUMN organizations.trial_started_at IS 'When the trial started';
COMMENT ON COLUMN organizations.trial_ends_at IS 'When the trial expires (14 days after start)';
