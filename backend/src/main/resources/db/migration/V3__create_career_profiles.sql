-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V3
-- Description: Create career_profiles table (Master Career Profile, 1-to-1 with users)
-- ==============================================================================

CREATE TABLE career_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    headline VARCHAR(255),
    summary TEXT,
    current_location VARCHAR(255),
    preferred_locations JSONB DEFAULT '[]'::jsonb,
    portfolio_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    website_url VARCHAR(500),
    years_of_experience NUMERIC(4, 1) DEFAULT 0.0,
    career_stage VARCHAR(50) DEFAULT 'ENTRY_LEVEL',
    career_preferences JSONB DEFAULT '{}'::jsonb,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_career_profiles_user_id UNIQUE (user_id),
    CONSTRAINT fk_career_profiles_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_career_profiles_completion CHECK (
        completion_percentage >= 0 AND completion_percentage <= 100
    ),
    CONSTRAINT chk_career_profiles_career_stage CHECK (
        career_stage IN ('STUDENT', 'ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR', 'LEAD', 'EXECUTIVE', 'CAREER_SWITCHER')
    )
);

CREATE INDEX idx_career_profiles_user_id ON career_profiles (user_id);
CREATE INDEX idx_career_profiles_career_stage ON career_profiles (career_stage);
