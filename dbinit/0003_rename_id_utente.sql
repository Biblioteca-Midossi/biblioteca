-- Migration 0003: Ensure utenti.id is named 'id'.
-- Idempotent: no-op on fresh DB.

ALTER TABLE utenti RENAME COLUMN id TO id;
