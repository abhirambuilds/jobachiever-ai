-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V2
-- Description: Create users table with case-insensitive unique email and status check
-- ==============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    account_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ,
    CONSTRAINT chk_users_account_status CHECK (
        account_status IN ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DEACTIVATED')
    )
);

-- Case-insensitive unique index for email
CREATE UNIQUE INDEX uq_users_email_lower ON users (LOWER(email));

-- Index for account status queries
CREATE INDEX idx_users_account_status ON users (account_status);
