-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V19
-- Description: Create career intelligence tables for skill gaps, recommendations,
--              personalized roadmaps, and milestone progress tracking
-- ==============================================================================

-- 1. Career Skill Gap Analyses
CREATE TABLE career_skill_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    career_track_id UUID NOT NULL,
    target_role VARCHAR(255) NOT NULL,
    provider VARCHAR(32) NOT NULL DEFAULT 'GROQ',
    model VARCHAR(128),
    summary TEXT,
    demonstrated_skills JSONB DEFAULT '[]'::jsonb,
    developing_skills JSONB DEFAULT '[]'::jsonb,
    missing_evidence_skills JSONB DEFAULT '[]'::jsonb,
    critical_priorities JSONB DEFAULT '[]'::jsonb,
    analysis_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_career_skill_gaps_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_career_skill_gaps_track FOREIGN KEY (career_track_id)
        REFERENCES career_tracks(id) ON DELETE CASCADE
);

CREATE INDEX idx_career_skill_gaps_user_track ON career_skill_gaps (user_id, career_track_id, created_at DESC);

-- 2. Career Recommendations History
CREATE TABLE career_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    career_track_id UUID NOT NULL,
    target_role VARCHAR(255) NOT NULL,
    provider VARCHAR(32) NOT NULL DEFAULT 'GROQ',
    model VARCHAR(128),
    recommendations_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_career_recommendations_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_career_recommendations_track FOREIGN KEY (career_track_id)
        REFERENCES career_tracks(id) ON DELETE CASCADE
);

CREATE INDEX idx_career_recommendations_user_track ON career_recommendations (user_id, career_track_id, created_at DESC);

-- 3. Career Roadmaps
CREATE TABLE career_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    career_track_id UUID NOT NULL,
    target_role VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS',
    provider VARCHAR(32) NOT NULL DEFAULT 'GROQ',
    model VARCHAR(128),
    estimated_duration VARCHAR(100),
    roadmap_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_career_roadmaps_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_career_roadmaps_track FOREIGN KEY (career_track_id)
        REFERENCES career_tracks(id) ON DELETE CASCADE
);

CREATE INDEX idx_career_roadmaps_user_track ON career_roadmaps (user_id, career_track_id, created_at DESC);

-- 4. Career Roadmap Milestones & Learning Progress
CREATE TABLE career_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL,
    user_id UUID NOT NULL,
    phase_number INTEGER NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
    related_skills JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    completion_criteria JSONB DEFAULT '[]'::jsonb,
    estimated_duration VARCHAR(100),
    start_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    personal_notes TEXT,
    evidence_links JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_career_milestones_roadmap FOREIGN KEY (roadmap_id)
        REFERENCES career_roadmaps(id) ON DELETE CASCADE,
    CONSTRAINT fk_career_milestones_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_career_milestones_status CHECK (
        status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')
    )
);

CREATE INDEX idx_career_milestones_roadmap ON career_milestones (roadmap_id, phase_number, created_at ASC);
CREATE INDEX idx_career_milestones_user_status ON career_milestones (user_id, status);
