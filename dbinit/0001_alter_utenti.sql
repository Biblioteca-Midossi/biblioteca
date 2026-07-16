-- Migration 0001: Add profile columns to utenti
-- Idempotent: safe to run on fresh DB or existing DB.

ALTER TABLE utenti ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);
ALTER TABLE utenti ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE utenti ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE utenti ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10);
ALTER TABLE utenti ADD COLUMN IF NOT EXISTS notification_settings JSONB;
