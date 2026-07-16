-- Migration 0004: Rename id_istituto to istituto (now holds istituto_enum directly).
-- Idempotent: safe if columns already renamed.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'collocazioni' AND column_name = 'id_istituto'
    ) THEN
        ALTER TABLE collocazioni RENAME COLUMN id_istituto TO istituto;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'utenti' AND column_name = 'id_istituto'
    ) THEN
        ALTER TABLE utenti RENAME COLUMN id_istituto TO istituto;
    END IF;
END $$;
