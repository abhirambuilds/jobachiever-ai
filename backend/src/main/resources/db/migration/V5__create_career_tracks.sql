-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V5
-- Description: Create career_tracks table for multi-track persona management
-- ==============================================================================

CREATE TABLE career_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    profile_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    target_role VARCHAR(255) NOT NULL,
    description TEXT,
    preferred_locations JSONB DEFAULT '[]'::jsonb,
    employment_types JSONB DEFAULT '[]'::jsonb,
    required_skills JSONB DEFAULT '[]'::jsonb,
    target_companies JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_career_tracks_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_career_tracks_profile FOREIGN KEY (profile_id)
        REFERENCES career_profiles(id) ON DELETE CASCADE,
    CONSTRAINT uq_career_tracks_user_name UNIQUE (user_id, name)
);

CREATE INDEX idx_career_tracks_user_id ON career_tracks (user_id);
CREATE INDEX idx_career_tracks_profile_id ON career_tracks (profile_id);
CREATE INDEX idx_career_tracks_is_active ON career_tracks (is_active);
