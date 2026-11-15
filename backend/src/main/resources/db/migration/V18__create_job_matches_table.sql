-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V18
-- Description: Create job_matches table for storing explainable resume-job
--              compatibility analyses, dimensional scores, and evidence items
-- ==============================================================================

CREATE TABLE job_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    resume_id UUID NOT NULL,
    resume_version_id UUID,
    job_id UUID,
    job_analysis_id UUID,
    provider VARCHAR(32) NOT NULL,
    model VARCHAR(128),
    overall_score INTEGER NOT NULL,
    required_skills_score INTEGER,
    preferred_skills_score INTEGER,
    experience_score INTEGER,
    qualifications_score INTEGER,
    responsibilities_score INTEGER,
    confidence_score NUMERIC(5, 2),
    match_summary TEXT,
    match_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_matches_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_matches_resume FOREIGN KEY (resume_id)
        REFERENCES resume_documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_matches_resume_version FOREIGN KEY (resume_version_id)
        REFERENCES resume_versions(id) ON DELETE SET NULL,
    CONSTRAINT fk_job_matches_job FOREIGN KEY (job_id)
        REFERENCES jobs(id) ON DELETE SET NULL,
    CONSTRAINT fk_job_matches_job_analysis FOREIGN KEY (job_analysis_id)
        REFERENCES job_analyses(id) ON DELETE SET NULL,
    CONSTRAINT chk_job_matches_overall_score CHECK (
        overall_score >= 0 AND overall_score <= 100
    )
);

CREATE INDEX idx_job_matches_user_created ON job_matches (user_id, created_at DESC);
CREATE INDEX idx_job_matches_user_resume ON job_matches (user_id, resume_id, created_at DESC);
CREATE INDEX idx_job_matches_user_job ON job_matches (user_id, job_id, created_at DESC);
