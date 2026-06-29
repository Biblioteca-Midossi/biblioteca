-- Rename id_istituto to istituto in both tables now that the column
-- holds istituto_enum values directly (no longer an integer FK).
ALTER TABLE collocazioni RENAME COLUMN id_istituto TO istituto;
ALTER TABLE utenti RENAME COLUMN id_istituto TO istituto;
