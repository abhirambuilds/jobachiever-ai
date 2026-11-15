-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V17
-- Description: Create job_analyses table for storing AI-extracted structured job
--              requirements, skill breakdowns, qualifications, and role metadata
-- ==============================================================================

CREATE TABLE job_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    job_id UUID,
    provider VARCHAR(32) NOT NULL,
    model VARCHAR(128),
    job_title VARCHAR(255),
    company_name VARCHAR(255),
    seniority VARCHAR(32),
    employment_type VARCHAR(32),
    work_arrangement VARCHAR(32),
    location VARCHAR(255),
    experience_summary VARCHAR(255),
    summary TEXT,
    analysis_json JSONB NOT NULL,
    raw_description_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_analyses_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_analyses_job FOREIGN KEY (job_id)
        REFERENCES jobs(id) ON DELETE SET NULL
);

CREATE INDEX idx_job_analyses_user_created ON job_analyses (user_id, created_at DESC);
CREATE INDEX idx_job_analyses_user_job_created ON job_analyses (user_id, job_id, created_at DESC);
CREATE INDEX idx_job_analyses_user_hash ON job_analyses (user_id, raw_description_hash);
