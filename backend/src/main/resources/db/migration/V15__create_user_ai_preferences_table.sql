-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V15
-- Description: Create user_ai_preferences table for storing user AI provider settings and consent
-- ==============================================================================

CREATE TABLE user_ai_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    selected_provider VARCHAR(32) NOT NULL DEFAULT 'GROQ',
    preferred_model VARCHAR(128),
    temperature DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    max_tokens INTEGER NOT NULL DEFAULT 2048,
    external_processing_consent BOOLEAN NOT NULL DEFAULT FALSE,
    consent_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_ai_preferences_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_ai_preferences_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_ai_selected_provider CHECK (
        selected_provider IN ('GROQ', 'GEMINI')
    ),
    CONSTRAINT chk_ai_temperature CHECK (
        temperature >= 0.0 AND temperature <= 2.0
    ),
    CONSTRAINT chk_ai_max_tokens CHECK (
        max_tokens >= 128 AND max_tokens <= 8192
    )
);

CREATE INDEX idx_user_ai_preferences_user_id ON user_ai_preferences (user_id);
