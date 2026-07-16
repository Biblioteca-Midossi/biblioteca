-- Migration 0002: Migrate from istituti table + integer FK to istituto_enum.
-- Idempotent: only runs if old istituti table still exists.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'istituti') THEN
        -- Create enum type if not yet created
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'istituto_enum') THEN
            CREATE TYPE istituto_enum AS ENUM ('EXT', 'ITT', 'LAC', 'LAV');
        END IF;

        -- Drop foreign keys
        ALTER TABLE collocazioni DROP CONSTRAINT IF EXISTS collocazioni_id_istituto_fkey;
        ALTER TABLE utenti DROP CONSTRAINT IF EXISTS utenti_id_istituto_fkey;

        -- Migrate collocazioni
        ALTER TABLE collocazioni
            ALTER COLUMN id_istituto TYPE istituto_enum
            USING CASE (id_istituto)
                WHEN 0 THEN 'EXT'::istituto_enum
                WHEN 1 THEN 'ITT'::istituto_enum
                WHEN 2 THEN 'LAC'::istituto_enum
                WHEN 3 THEN 'LAV'::istituto_enum
            END;

        -- Migrate utenti
        ALTER TABLE utenti
            ALTER COLUMN id_istituto TYPE istituto_enum
            USING CASE (id_istituto)
                WHEN 0 THEN 'EXT'::istituto_enum
                WHEN 1 THEN 'ITT'::istituto_enum
                WHEN 2 THEN 'LAC'::istituto_enum
                WHEN 3 THEN 'LAV'::istituto_enum
            END;

        -- Drop old table
        DROP TABLE istituti;
    END IF;
END $$;
