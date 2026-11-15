-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V13
-- Description: Enhance career_tracks with target_seniority, industries, preferred_skills, career_goals, priority, and is_primary
-- ==============================================================================

ALTER TABLE career_tracks
    ADD COLUMN IF NOT EXISTS target_seniority VARCHAR(50) DEFAULT 'ENTRY_LEVEL',
    ADD COLUMN IF NOT EXISTS industries JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS preferred_skills JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS career_goals TEXT,
    ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_career_tracks_user_priority ON career_tracks (user_id, priority);
