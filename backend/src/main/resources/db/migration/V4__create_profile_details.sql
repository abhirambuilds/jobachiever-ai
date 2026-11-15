-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V4
-- Description: Create structured master career profile child entities
-- ==============================================================================

-- 1. Education
CREATE TABLE profile_educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    grade_or_gpa VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_educations_profile FOREIGN KEY (profile_id)
        REFERENCES career_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_profile_educations_profile_id ON profile_educations (profile_id);

-- 2. Skills
CREATE TABLE profile_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'TECHNICAL',
    proficiency_level VARCHAR(32) NOT NULL DEFAULT 'INTERMEDIATE',
    years_of_experience NUMERIC(3, 1),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_skills_profile FOREIGN KEY (profile_id)
        REFERENCES career_profiles(id) ON DELETE CASCADE,
    CONSTRAINT chk_profile_skills_category CHECK (
        category IN ('TECHNICAL', 'SOFT', 'TOOL', 'LANGUAGE', 'DOMAIN')
    ),
    CONSTRAINT chk_profile_skills_proficiency CHECK (
        proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
    )
);

CREATE UNIQUE INDEX uq_profile_skills_profile_name ON profile_skills (profile_id, LOWER(name));
CREATE INDEX idx_profile_skills_profile_id ON profile_skills (profile_id);
CREATE INDEX idx_profile_skills_name ON profile_skills (name);

-- 3. Work Experience
CREATE TABLE profile_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    employment_type VARCHAR(50) DEFAULT 'FULL_TIME',
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_experiences_profile FOREIGN KEY (profile_id)
        REFERENCES career_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_profile_experiences_profile_id ON profile_experiences (profile_id);

-- 4. Projects
CREATE TABLE profile_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    technologies JSONB DEFAULT '[]'::jsonb,
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_projects_profile FOREIGN KEY (profile_id)
        REFERENCES career_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_profile_projects_profile_id ON profile_projects (profile_id);

-- 5. Certifications
CREATE TABLE profile_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    issue_date DATE,
    expiration_date DATE,
    credential_id VARCHAR(255),
    credential_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_certifications_profile FOREIGN KEY (profile_id)
        REFERENCES career_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_profile_certifications_profile_id ON profile_certifications (profile_id);

-- 6. Achievements
CREATE TABLE profile_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    achievement_date DATE,
    issuer VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_achievements_profile FOREIGN KEY (profile_id)
        REFERENCES career_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_profile_achievements_profile_id ON profile_achievements (profile_id);
