-- Attunly Revamp: Availability-First Coordination Platform
-- Migration: 20251219_revamp_availability_first.sql
--
-- This migration transforms Attunly from a skill-matching platform
-- to an availability-first coordination tool for remote teams.
--
-- Key changes:
-- 1. Remove complexity (proficiency levels, match scores)
-- 2. Add knowledge areas (lightweight tags, not skills)
-- 3. Add manager controls for pods
-- 4. Add cross-pod help toggle
-- 5. Enhance notifications with meeting context

-- ============================================
-- PHASE 1: ADD NEW COLUMNS
-- ============================================

-- Add knowledge_areas to profiles (replaces expertise_skills concept)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS knowledge_areas text[];

-- Add currently_available status toggle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currently_available boolean DEFAULT false;

-- Add looking_to_help flag
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_to_help boolean DEFAULT true;

-- Add manager_id to pods (user who controls the pod)
ALTER TABLE pods ADD COLUMN IF NOT EXISTS manager_id uuid;

-- Add allow_cross_pod_help toggle to pods
ALTER TABLE pods ADD COLUMN IF NOT EXISTS allow_cross_pod_help boolean DEFAULT false;

-- ============================================
-- PHASE 2: MIGRATE DATA
-- ============================================

-- Migrate expertise_skills to knowledge_areas (preserve existing data)
UPDATE profiles
SET knowledge_areas = expertise_skills
WHERE expertise_skills IS NOT NULL AND knowledge_areas IS NULL;

-- Set manager_id to the creator for existing pods
UPDATE pods
SET manager_id = created_by
WHERE manager_id IS NULL;

-- ============================================
-- PHASE 3: REMOVE DEPRECATED COLUMNS
-- ============================================

-- Remove proficiency-related columns from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS expertise_levels;
ALTER TABLE profiles DROP COLUMN IF EXISTS growth_levels;
ALTER TABLE profiles DROP COLUMN IF EXISTS growth_skills;

-- Remove unused legacy columns
ALTER TABLE profiles DROP COLUMN IF EXISTS strengths;
ALTER TABLE profiles DROP COLUMN IF EXISTS study_style;
ALTER TABLE profiles DROP COLUMN IF EXISTS study_time_preference;
ALTER TABLE profiles DROP COLUMN IF EXISTS academic_goal;
ALTER TABLE profiles DROP COLUMN IF EXISTS location_preference;
ALTER TABLE profiles DROP COLUMN IF EXISTS collaboration_preference;
ALTER TABLE profiles DROP COLUMN IF EXISTS current_projects;
ALTER TABLE profiles DROP COLUMN IF EXISTS reliability;

-- Keep expertise_skills for now as alias, will be removed in future migration
-- ALTER TABLE profiles DROP COLUMN IF EXISTS expertise_skills;

-- ============================================
-- PHASE 4: DROP DEPRECATED TABLES
-- ============================================

-- Drop compatibility_scores table (no more complex matching)
DROP TABLE IF EXISTS compatibility_scores;

-- Drop open_requests table (replaced by knowledge tags + nudges)
DROP TABLE IF EXISTS open_requests;

-- ============================================
-- PHASE 5: ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Index for finding available users quickly
CREATE INDEX IF NOT EXISTS idx_profiles_currently_available
ON profiles(currently_available) WHERE currently_available = true;

-- Index for knowledge area searches
CREATE INDEX IF NOT EXISTS idx_profiles_knowledge_areas
ON profiles USING GIN(knowledge_areas);

-- Index for manager lookups
CREATE INDEX IF NOT EXISTS idx_pods_manager_id
ON pods(manager_id);

-- ============================================
-- PHASE 6: UPDATE RLS POLICIES (if needed)
-- ============================================

-- Manager can update pod settings
-- (This assumes RLS is already enabled on pods table)

-- Note: Run these only if RLS is enabled on pods
-- CREATE POLICY "Managers can update their pods" ON pods
--   FOR UPDATE USING (auth.uid() = manager_id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251219_revamp_availability_first completed successfully';
  RAISE NOTICE 'New columns added: knowledge_areas, currently_available, looking_to_help, manager_id, allow_cross_pod_help';
  RAISE NOTICE 'Deprecated tables dropped: compatibility_scores, open_requests';
  RAISE NOTICE 'Deprecated columns removed from profiles';
END $$;
