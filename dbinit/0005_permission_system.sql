-- Migration 0005: Permission system (roles, permissions, sessions).
-- Idempotent: tables use IF NOT EXISTS; data migration only runs
-- if legacy ruolo column exists.

BEGIN;

-- ══════════════════ NEW TABLES ══════════════════

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

-- updated_at trigger for roles
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

-- ══════════════════ MIGRATE EXISTING UTENTI ══════════════════
-- This only runs on DBs that still have the legacy integer ruolo column.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'utenti' AND column_name = 'ruolo'
    ) THEN
        ALTER TABLE utenti ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id);

        UPDATE utenti u SET role_id = (
            CASE
                WHEN u.ruolo >= 3 THEN (SELECT id FROM roles WHERE name = 'admin')
                WHEN u.ruolo = 2  THEN (SELECT id FROM roles WHERE name = 'bibliotecario')
                ELSE                   (SELECT id FROM roles WHERE name = 'utente')
            END
        );

        ALTER TABLE utenti ALTER COLUMN role_id SET NOT NULL;
        ALTER TABLE utenti ALTER COLUMN role_id SET DEFAULT (SELECT id FROM roles WHERE name = 'utente');
    END IF;
END $$;

COMMIT;
