CREATE TABLE IF NOT EXISTS autori (
    id_autore SERIAL PRIMARY KEY,
    nome VARCHAR(50),
    cognome VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS istituti (
    id_istituto INTEGER PRIMARY KEY NOT NULL,
    nome_istituto VARCHAR(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS collocazioni (
    id_collocazione SERIAL PRIMARY KEY,
    id_istituto INTEGER REFERENCES istituti,
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

CREATE TABLE IF NOT EXISTS utenti (
    id_utente SERIAL PRIMARY KEY,
    cognome VARCHAR(64) NOT NULL,
    nome VARCHAR(64) NOT NULL,
    id_istituto INTEGER REFERENCES istituti,
    ruolo INTEGER NOT NULL DEFAULT 0,
    password VARCHAR(256) NOT NULL,
    username VARCHAR(64) NOT NULL,
    email VARCHAR(384) NOT NULL
);

CREATE TABLE IF NOT EXISTS prenotazioni (
    id_prenotazione SERIAL PRIMARY KEY,
    id_utente BIGINT NOT NULL REFERENCES utenti,
    id_libro BIGINT NOT NULL REFERENCES libri,
    inizio_prenotazione DATE NOT NULL,
    fine_prenotazione DATE NOT NULL
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

-- 'EXT': 0, 'ITT': 1, 'LAC': 2, 'LAV': 3
INSERT INTO istituti(id_istituto, nome_istituto) VALUES
(0, 'EXT'),
(1, 'ITT'),
(2, 'LAC'),
(3, 'LAV');
