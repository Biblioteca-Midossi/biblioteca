-- create enum type
CREATE TYPE istituto_enum AS ENUM ('EXT', 'ITT', 'LAC', 'LAV');

-- drop foreign keys first
ALTER TABLE collocazioni DROP CONSTRAINT IF EXISTS collocazioni_id_istituto_fkey;
ALTER TABLE utenti DROP CONSTRAINT IF EXISTS utenti_id_istituto_fkey;

-- migrate collocazioni
ALTER TABLE collocazioni
    ALTER COLUMN id_istituto TYPE istituto_enum
    USING CASE (id_istituto)
        WHEN 0 THEN 'EXT'::istituto_enum
        WHEN 1 THEN 'ITT'::istituto_enum
        WHEN 2 THEN 'LAC'::istituto_enum
        WHEN 3 THEN 'LAV'::istituto_enum
    END;

-- migrate utenti
ALTER TABLE utenti
    ALTER COLUMN id_istituto TYPE istituto_enum
    USING CASE (id_istituto)
        WHEN 0 THEN 'EXT'::istituto_enum
        WHEN 1 THEN 'ITT'::istituto_enum
        WHEN 2 THEN 'LAC'::istituto_enum
        WHEN 3 THEN 'LAV'::istituto_enum
    END;

-- drop table
DROP TABLE istituti