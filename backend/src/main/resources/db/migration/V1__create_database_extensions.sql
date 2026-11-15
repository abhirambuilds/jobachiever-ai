-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V1
-- Description: Initialize core database extensions for UUID and pgvector support
-- ==============================================================================

-- Enable standard UUID generation extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Attempt to enable vector extension if pgvector is available in the PostgreSQL distribution.
-- If pgvector is not installed on the host or custom image, a notice is logged rather
-- than failing the migration, ensuring the database remains functional.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_available_extensions WHERE name = 'vector'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS "vector";
        RAISE NOTICE 'pgvector extension successfully initialized.';
    ELSE
        RAISE WARNING 'pgvector extension is not available in this PostgreSQL distribution. '
                      'Semantic search will require installing the pgvector package or using the '
                      'pgvector/pgvector:pg16 Docker image.';
    END IF;
END $$;
