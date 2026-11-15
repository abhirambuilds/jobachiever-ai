-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V11
-- Description: Add user role column and create security_audit_logs table
-- ==============================================================================

-- 1. Add Role Column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'USER';
ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN'));
CREATE INDEX idx_users_role ON users (role);

-- 2. Create security_audit_logs table for tracking security-relevant events
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL,
    user_id UUID,
    email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    details VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_security_audit_logs_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_security_audit_logs_status CHECK (
        status IN ('SUCCESS', 'FAILURE', 'WARNING')
    )
);

CREATE INDEX idx_security_audit_logs_event_type ON security_audit_logs (event_type);
CREATE INDEX idx_security_audit_logs_user_id ON security_audit_logs (user_id);
CREATE INDEX idx_security_audit_logs_created_at ON security_audit_logs (created_at);
