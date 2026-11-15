-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V16
-- Description: Create resume_analyses table for storing AI-generated resume quality
--              reports, multi-dimension scores, and detailed section critiques
-- ==============================================================================

CREATE TABLE resume_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    resume_id UUID NOT NULL,
    version_id UUID,
    provider VARCHAR(32) NOT NULL,
    model VARCHAR(128),
    overall_score INTEGER NOT NULL,
    overall_rating VARCHAR(32) NOT NULL,
    summary TEXT,
    analysis_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_analyses_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_analyses_resume FOREIGN KEY (resume_id)
        REFERENCES resume_documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_analyses_version FOREIGN KEY (version_id)
        REFERENCES resume_versions(id) ON DELETE SET NULL,
    CONSTRAINT chk_resume_analyses_score CHECK (
        overall_score >= 0 AND overall_score <= 100
    ),
    CONSTRAINT chk_resume_analyses_rating CHECK (
        overall_rating IN ('POOR', 'FAIR', 'GOOD', 'EXCELLENT')
    )
);

CREATE INDEX idx_resume_analyses_user_resume_created ON resume_analyses (user_id, resume_id, created_at DESC);
CREATE INDEX idx_resume_analyses_user_created ON resume_analyses (user_id, created_at DESC);
