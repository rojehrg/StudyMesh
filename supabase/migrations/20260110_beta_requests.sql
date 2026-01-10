-- Beta requests table for collecting beta signups
CREATE TABLE IF NOT EXISTS beta_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  company_size TEXT NOT NULL,
  role TEXT NOT NULL,
  blocker TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_beta_requests_email ON beta_requests(email);
CREATE INDEX IF NOT EXISTS idx_beta_requests_created_at ON beta_requests(created_at DESC);
