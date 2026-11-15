-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V9
-- Description: Create revoked_tokens table for logout and token invalidation
-- ==============================================================================

CREATE TABLE revoked_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_identifier VARCHAR(64) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_revoked_tokens_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_revoked_tokens_identifier ON revoked_tokens (token_identifier);
CREATE INDEX idx_revoked_tokens_expires_at ON revoked_tokens (expires_at);
