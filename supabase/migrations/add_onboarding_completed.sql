-- Add onboarding_completed column to profiles table
-- This tracks whether users have seen the onboarding tour

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
