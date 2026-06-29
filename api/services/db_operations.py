import psycopg
from fastapi import HTTPException, UploadFile
from starlette.responses import JSONResponse
from api.exceptions import InvalidRequestError
from api.models.requests import AutoreData, CollocazioneData, CreateBookPayload, LibroData
from api.services.file_operations import upload_thumbnail
from api.lib.database import PSQLDatabase
from api.lib.logger import log


def check_isbn_exists(isbn: str) -> bool:
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute("select count(*) from libri where isbn = %s", (isbn,))
        return cursor.fetchone()[0] > 0


def insert_collocazione(collocazione: CollocazioneData) -> int:
    scaffale = collocazione.scaffale.upper()
    istituto = collocazione.istituto.upper()

    with PSQLDatabase() as db:
        cursor = db.get_cursor()

        cursor.execute(
            "select id_collocazione from collocazioni "
            "where scaffale = %s and istituto = %s",
            (scaffale, istituto),
        )

        id_collocazione = cursor.fetchone()
        if id_collocazione:
            return id_collocazione[0]
        else:
            cursor.execute(
                "insert into collocazioni"
                "(istituto, scaffale) values (%s, %s) "
                "returning id_collocazione",
                (istituto, scaffale),
            )
            db.commit()
            return cursor.fetchone()[0]


def insert_autore(autore: AutoreData) -> int:
    nome = autore.nome
    cognome = autore.cognome

    with PSQLDatabase() as db:
        cursor = db.get_cursor()

        cursor.execute(
            "select id_autore from autori where nome = %s and cognome = %s",
            (nome, cognome),
        )
        author = cursor.fetchone()
        if author:
            return author[0]
        else:
            cursor.execute(
                "insert into autori "
                "(nome, cognome) values (%s, %s) "
                "returning id_autore",
                (nome, cognome),
            )
            db.commit()
            return cursor.fetchone()[0]


def insert_libro(libro: LibroData, id_collocazione: int):
    with PSQLDatabase() as db:
        cursor = db.get_cursor()

        cursor.execute(
            "insert into libri"
            "(id_collocazione, isbn, titolo, "
            "quantita, casa_editrice, descrizione) "
            "values (%s, %s, %s, %s, %s, %s) "
            "returning id_libro",
            (
                id_collocazione,
                libro.isbn,
                libro.titolo,
                str(libro.quantita),
                libro.casa_editrice,
                libro.descrizione,
            ),
        )
        id_libro = cursor.fetchone()[0]

        db.commit()
        return id_libro


def insert_libro_autori(id_libro: int, id_autore: int):
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            "insert into libro_autori (id_libro, id_autore) values (%s, %s)",
            (id_libro, id_autore),
        )
        db.commit()


async def insert_book_into_database(data: CreateBookPayload, thumbnail: UploadFile | None):
    collocazione = CollocazioneData(
        istituto=data.istituto,
        scaffale=data.scaffale,
    )

    libro = LibroData(
        isbn=data.isbn,
        titolo=data.titolo,
        quantita=data.quantita,
        casa_editrice=data.casa_editrice,
        descrizione=data.descrizione,
    )

    # Parse authors
    author_names = [name.strip() for names in data.nome_autore for name in names.split(",")]
    author_surnames = [
        surname.strip()
        for surnames in data.cognome_autore
        for surname in surnames.split(",")
    ]

    if len(author_names) != len(author_surnames):
        raise HTTPException(
            status_code=400, detail="Mismatch between number of names and surnames"
        )

    authors = [
        AutoreData(nome=nome, cognome=cognome)
        for nome, cognome in zip(author_names, author_surnames)
    ]

    try:
        if check_isbn_exists(libro.isbn):
            with PSQLDatabase() as db:
                cursor = db.get_cursor()
                cursor.execute(
                    "update libri set quantita = libri.quantita + 1 where isbn = %s",
                    (libro.isbn,),
                )
                db.commit()
            return JSONResponse(
                {
                    "message": "The Book is already in the database and the inventory has been updated"
                },
                201,
            )

        id_collocazione = insert_collocazione(collocazione)
        id_libro = insert_libro(libro, id_collocazione)

        for author in authors:
            id_autore = insert_autore(author)
            insert_libro_autori(id_libro, id_autore)
        if thumbnail:
            await upload_thumbnail(thumbnail, id_libro)
        log.info(f"Book '{libro.titolo}' inserted successfully into the database.")
        return JSONResponse({"status": "successful"}, 201)

    except InvalidRequestError as e:
        log.error(f"Invalid request: {e}.")
        raise HTTPException(status_code=400, detail=str(e))
    except psycopg.Error as e:
        log.error(f"Database error: {e}.")
        raise HTTPException(status_code=500, detail="database error")
    except Exception as e:
        log.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error")
