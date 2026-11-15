-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V8
-- Description: Create job_applications and application_activities tables
-- ==============================================================================

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    job_id UUID NOT NULL,
    resume_version_id UUID,
    career_track_id UUID,
    status VARCHAR(32) NOT NULL DEFAULT 'SAVED',
    applied_at TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    notes TEXT,
    company_contact_info JSONB DEFAULT '{}'::jsonb,
    interview_dates JSONB DEFAULT '[]'::jsonb,
    offer_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_applications_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_applications_job FOREIGN KEY (job_id)
        REFERENCES jobs(id) ON DELETE RESTRICT,
    CONSTRAINT fk_job_applications_resume_ver FOREIGN KEY (resume_version_id)
        REFERENCES resume_versions(id) ON DELETE SET NULL,
    CONSTRAINT fk_job_applications_track FOREIGN KEY (career_track_id)
        REFERENCES career_tracks(id) ON DELETE SET NULL,
    CONSTRAINT uq_job_applications_user_job UNIQUE (user_id, job_id),
    CONSTRAINT chk_job_applications_status CHECK (
        status IN ('SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN')
    )
);

CREATE INDEX idx_job_applications_user_id ON job_applications (user_id);
CREATE INDEX idx_job_applications_job_id ON job_applications (job_id);
CREATE INDEX idx_job_applications_status ON job_applications (status);
CREATE INDEX idx_job_applications_user_status ON job_applications (user_id, status);

CREATE TABLE application_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    previous_status VARCHAR(32),
    new_status VARCHAR(32),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_application_activities_app FOREIGN KEY (application_id)
        REFERENCES job_applications(id) ON DELETE CASCADE
);

CREATE INDEX idx_application_activities_app_id ON application_activities (application_id);
CREATE INDEX idx_application_activities_type ON application_activities (activity_type);
