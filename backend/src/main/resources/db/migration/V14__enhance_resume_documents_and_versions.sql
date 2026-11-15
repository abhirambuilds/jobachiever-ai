-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V14
-- Description: Enhance resume_documents and resume_versions for secure file storage,
--              version tracking, primary resume management, and status lifecycle
-- ==============================================================================

-- 1. Enhance resume_documents with description, primary indicator, and current version reference
ALTER TABLE resume_documents
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS current_version_id UUID;

-- Synchronize is_primary with existing is_master
UPDATE resume_documents SET is_primary = is_master WHERE is_master = TRUE;

-- Add foreign key constraint for current_version_id (self-referencing resume_versions)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_resume_documents_current_version'
    ) THEN
        ALTER TABLE resume_documents
            ADD CONSTRAINT fk_resume_documents_current_version
            FOREIGN KEY (current_version_id)
            REFERENCES resume_versions(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Enhance resume_versions with storage_key and expanded lifecycle status constraint
ALTER TABLE resume_versions
    ADD COLUMN IF NOT EXISTS storage_key VARCHAR(255);

-- Update existing rows to populate storage_key from storage_path if null
UPDATE resume_versions SET storage_key = storage_path WHERE storage_key IS NULL;

-- Drop and recreate processing status check constraint to support explicit lifecycle statuses
ALTER TABLE resume_versions DROP CONSTRAINT IF EXISTS chk_resume_versions_status;
ALTER TABLE resume_versions ADD CONSTRAINT chk_resume_versions_status CHECK (
    processing_status IN (
        'UPLOADED', 'VALIDATING', 'READY', 'FAILED', 'DELETED',
        'PENDING', 'PARSING', 'PARSED'
    )
);

-- 3. Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_resume_documents_user_primary ON resume_documents (user_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_resume_documents_user_created ON resume_documents (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_versions_checksum ON resume_versions (sha256_checksum);
CREATE INDEX IF NOT EXISTS idx_resume_versions_doc_ver ON resume_versions (document_id, version_number DESC);
