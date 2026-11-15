-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V7
-- Description: Create shared jobs catalog and job_requirements decomposition tables
-- ==============================================================================

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    workplace_type VARCHAR(32) NOT NULL DEFAULT 'ON_SITE',
    employment_type VARCHAR(32) NOT NULL DEFAULT 'FULL_TIME',
    experience_level VARCHAR(32) DEFAULT 'MID_LEVEL',
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    source_name VARCHAR(100),
    external_url VARCHAR(1000),
    posted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    job_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    source_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_jobs_workplace_type CHECK (
        workplace_type IN ('REMOTE', 'HYBRID', 'ON_SITE')
    ),
    CONSTRAINT chk_jobs_employment_type CHECK (
        employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP')
    ),
    CONSTRAINT chk_jobs_experience_level CHECK (
        experience_level IN ('ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR', 'LEAD', 'EXECUTIVE')
    ),
    CONSTRAINT chk_jobs_status CHECK (
        job_status IN ('ACTIVE', 'EXPIRED', 'CLOSED', 'DRAFT')
    )
);

CREATE INDEX idx_jobs_title ON jobs (title);
CREATE INDEX idx_jobs_company_name ON jobs (company_name);
CREATE INDEX idx_jobs_status ON jobs (job_status);
CREATE INDEX idx_jobs_workplace_type ON jobs (workplace_type);

CREATE TABLE job_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    requirement_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'SKILL',
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    importance_level VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_requirements_job FOREIGN KEY (job_id)
        REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT chk_job_requirements_category CHECK (
        category IN ('SKILL', 'EDUCATION', 'EXPERIENCE', 'CERTIFICATION', 'LANGUAGE', 'OTHER')
    ),
    CONSTRAINT chk_job_requirements_importance CHECK (
        importance_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')
    )
);

CREATE INDEX idx_job_requirements_job_id ON job_requirements (job_id);
CREATE INDEX idx_job_requirements_category ON job_requirements (category);
