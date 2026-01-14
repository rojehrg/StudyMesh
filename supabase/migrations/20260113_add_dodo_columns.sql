-- Add Dodo Payments columns to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT,
ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_dodo_customer_id ON organizations(dodo_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_dodo_subscription_id ON organizations(dodo_subscription_id);
