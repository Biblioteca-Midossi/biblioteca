-- 0000_create_db.sql — Final schema for a fresh database.
-- All subsequent migration scripts (0001-0005) are idempotent
-- and safe to run on top of this.

BEGIN;

-- ══════════════════ ENUMS ══════════════════

-- istituto_enum: created via DO block because CREATE TYPE IF NOT EXISTS
-- is not supported in PostgreSQL.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'istituto_enum') THEN
        CREATE TYPE istituto_enum AS ENUM ('EXT', 'ITT', 'LAC', 'LAV');
    END IF;
END $$;
CREATE TABLE IF NOT EXISTS autori (
    id_autore SERIAL PRIMARY KEY,
    nome VARCHAR(50),
    cognome VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS collocazioni (
    id_collocazione SERIAL PRIMARY KEY,
    istituto istituto_enum,
    scaffale VARCHAR(3)
);

CREATE TABLE IF NOT EXISTS libri (
    id_collocazione INTEGER REFERENCES collocazioni,
    isbn VARCHAR(64) NOT NULL,
    titolo VARCHAR(128),
    genere VARCHAR(256),
    quantita INTEGER,
    casa_editrice VARCHAR(128),
    descrizione VARCHAR(1024),
    thumbnail_path VARCHAR(256),
    id_libro SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS libro_autori (
    id_libro INTEGER NOT NULL REFERENCES libri ON DELETE CASCADE,
    id_autore INTEGER NOT NULL REFERENCES autori ON DELETE CASCADE,
    PRIMARY KEY (id_libro, id_autore)
);

CREATE TABLE IF NOT EXISTS generi (
    id_genere SERIAL PRIMARY KEY,
    nome_genere VARCHAR(256) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS libro_generi (
    id_libro INTEGER NOT NULL REFERENCES libri ON DELETE CASCADE,
    id_genere INTEGER NOT NULL REFERENCES generi ON DELETE CASCADE,
    PRIMARY KEY (id_libro, id_genere)
);

-- ══════════════════ USERS & AUTH ══════════════════

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    color VARCHAR(20) DEFAULT 'gray',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_position ON roles(position);

CREATE TABLE IF NOT EXISTS utenti (
    id SERIAL PRIMARY KEY,
    cognome VARCHAR(64) NOT NULL,
    nome VARCHAR(64) NOT NULL,
    istituto istituto_enum,
    role_id INTEGER NOT NULL DEFAULT 1 REFERENCES roles(id),
    password VARCHAR(256) NOT NULL,
    username VARCHAR(64) NOT NULL,
    email VARCHAR(384) NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,
    last_login TIMESTAMP,
    preferred_language VARCHAR(10),
    notification_settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    group_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

-- ══════════════════ BOOKINGS ══════════════════

CREATE TABLE IF NOT EXISTS prenotazioni (
    id_prenotazione SERIAL PRIMARY KEY,
    id BIGINT NOT NULL REFERENCES utenti,
    id_libro BIGINT NOT NULL REFERENCES libri,
    inizio_prenotazione DATE NOT NULL,
    fine_prenotazione DATE NOT NULL
);

-- ══════════════════ TRIGGER ══════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ══════════════════ SEED DATA ══════════════════

INSERT INTO permissions (name, display_name, group_name) VALUES
('view_books',      'Visualizzare libri',           'books'),
('create_book',     'Creare libri',                 'books'),
('edit_book',       'Modificare libri',             'books'),
('delete_book',     'Cancellare libri',             'books'),
('view_users',      'Visualizzare utenti',          'users'),
('edit_user',       'Modificare utenti',            'users'),
('view_dashboard',  'Visualizzare dashboard',       'admin'),
('view_roles',      'Visualizzare ruoli',           'roles'),
('manage_roles',    'Gestire ruoli',                'roles')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, display_name, position, color) VALUES
('admin',         'Amministratore', 1, 'red'),
('bibliotecario', 'Bibliotecario',  2, 'blue'),
('utente',        'Utente',         3, 'gray')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'bibliotecario'
  AND p.name IN ('view_books', 'create_book', 'edit_book', 'delete_book', 'view_users', 'view_dashboard')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'utente'
  AND p.name IN ('view_books')
ON CONFLICT DO NOTHING;

COMMIT;
