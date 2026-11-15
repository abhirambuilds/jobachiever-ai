-- ==============================================================================
-- JobAchiever AI — Database Schema Migration
-- Version: V12
-- Description: Add phone_number and country fields to career_profiles table
-- ==============================================================================

ALTER TABLE career_profiles
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS country VARCHAR(100);
