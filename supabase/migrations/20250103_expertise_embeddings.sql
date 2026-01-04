-- AI-Powered Expertise Matching
-- Enables semantic search for finding teammates with relevant expertise

-- 1. Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add expertise columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS expertise_text TEXT,
ADD COLUMN IF NOT EXISTS expertise_embedding vector(384);

-- 3. Create index for fast similarity search (IVFFlat for approximate nearest neighbor)
CREATE INDEX IF NOT EXISTS profiles_expertise_embedding_idx
ON profiles USING ivfflat (expertise_embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. RPC function to update expertise embedding (handles vector type conversion)
CREATE OR REPLACE FUNCTION update_expertise_embedding(
  p_user_id uuid,
  p_embedding text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET expertise_embedding = p_embedding::vector
  WHERE user_id = p_user_id;
END;
$$;

-- 5. RPC function for semantic similarity search
CREATE OR REPLACE FUNCTION find_similar_expertise(
  query_embedding text,
  org_id uuid,
  current_user_id uuid,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  expertise_text text,
  similarity float,
  currently_available boolean,
  major text,
  department text,
  timezone text,
  availability_slots jsonb,
  slack_connected boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.first_name,
    p.last_name,
    p.expertise_text,
    1 - (p.expertise_embedding <=> query_embedding::vector) as similarity,
    COALESCE((p.availability->>'currentlyAvailable')::boolean, false) as currently_available,
    p.major,
    p.department,
    p.timezone,
    p.availability->'slots' as availability_slots,
    COALESCE(p.slack_connected, false) as slack_connected
  FROM profiles p
  WHERE p.organization_id = org_id
    AND p.user_id != current_user_id
    AND p.expertise_embedding IS NOT NULL
  ORDER BY p.expertise_embedding <=> query_embedding::vector
  LIMIT match_count;
END;
$$;
