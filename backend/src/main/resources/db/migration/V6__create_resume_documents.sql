-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V6
-- Description: Create resume_documents and resume_versions tables
-- ==============================================================================

CREATE TABLE resume_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    career_track_id UUID,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(32) NOT NULL DEFAULT 'UPLOADED',
    is_master BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_documents_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_resume_documents_track FOREIGN KEY (career_track_id)
        REFERENCES career_tracks(id) ON DELETE SET NULL,
    CONSTRAINT chk_resume_documents_type CHECK (
        document_type IN ('UPLOADED', 'GENERATED', 'TAILORED')
    )
);

CREATE INDEX idx_resume_documents_user_id ON resume_documents (user_id);
CREATE INDEX idx_resume_documents_track_id ON resume_documents (career_track_id);

CREATE TABLE resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    storage_path VARCHAR(1000) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    processing_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    template_identifier VARCHAR(100),
    parsed_content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_versions_document FOREIGN KEY (document_id)
        REFERENCES resume_documents(id) ON DELETE CASCADE,
    CONSTRAINT uq_resume_versions_doc_num UNIQUE (document_id, version_number),
    CONSTRAINT chk_resume_versions_status CHECK (
        processing_status IN ('PENDING', 'PARSING', 'PARSED', 'FAILED')
    )
);

CREATE INDEX idx_resume_versions_document_id ON resume_versions (document_id);
CREATE INDEX idx_resume_versions_status ON resume_versions (processing_status);
