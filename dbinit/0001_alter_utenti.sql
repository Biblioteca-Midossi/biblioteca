-- New alter table utenti 11/12/2024
ALTER TABLE utenti
ADD COLUMN profile_picture VARCHAR(255),
ADD COLUMN bio TEXT,
ADD COLUMN last_login TIMESTAMP,
ADD COLUMN preferred_language VARCHAR(10),
ADD COLUMN notification_settings JSONB;