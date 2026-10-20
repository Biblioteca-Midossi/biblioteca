from fastapi import HTTPException, UploadFile
from psycopg import DatabaseError
from starlette.responses import JSONResponse

from api.exceptions import InvalidRequestError
from api.lib.database import PSQLDatabase
from api.lib.logger import log
from api.models.requests import (
    AutoreData,
    CollocazioneData,
    CreateBookPayload,
    LibroData,
)
from api.services.file_operations import upload_thumbnail


async def check_isbn_exists(isbn: str) -> bool:
    async with PSQLDatabase() as db:
        count = await db.fetch_scalar("select count(*) from libri where isbn = %s", (isbn,))
        return count > 0


async def insert_collocazione(collocazione: CollocazioneData) -> int:
    scaffale = collocazione.scaffale.upper()
    istituto = collocazione.istituto.upper()

    async with PSQLDatabase() as db:
        id_collocazione = await db.fetch_scalar(
            "select id_collocazione from collocazioni where scaffale = %s and istituto = %s",
            (scaffale, istituto),
        )
        if id_collocazione:
            return id_collocazione
        id_collocazione = await db.fetch_scalar(
            "insert into collocazioni (istituto, scaffale) values (%s, %s) returning id_collocazione",
            (istituto, scaffale),
        )
        await db.commit()
        return id_collocazione


async def insert_autore(autore: AutoreData) -> int:
    nome = autore.nome
    cognome = autore.cognome

    async with PSQLDatabase() as db:
        id_autore = await db.fetch_scalar(
            "select id_autore from autori where nome = %s and cognome = %s",
            (nome, cognome),
        )
        if id_autore:
            return id_autore
        id_autore = await db.fetch_scalar(
            "insert into autori (nome, cognome) values (%s, %s) returning id_autore",
            (nome, cognome),
        )
        await db.commit()
        return id_autore


async def insert_libro(libro: LibroData, id_collocazione: int) -> int:
    async with PSQLDatabase() as db:
        id_libro = await db.fetch_scalar(
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
        await db.commit()
        return id_libro


async def insert_libro_autori(id_libro: int, id_autore: int):
    async with PSQLDatabase() as db:
        await db.execute(
            "insert into libro_autori (id_libro, id_autore) values (%s, %s)",
            (id_libro, id_autore),
        )
        await db.commit()


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
        surname.strip() for surnames in data.cognome_autore for surname in surnames.split(",")
    ]

    if len(author_names) != len(author_surnames):
        raise HTTPException(status_code=400, detail="Mismatch between number of names and surnames")

    authors = [
        AutoreData(nome=nome, cognome=cognome)
        for nome, cognome in zip(author_names, author_surnames, strict=False)
    ]

    try:
        if await check_isbn_exists(libro.isbn):
            async with PSQLDatabase() as db:
                await db.execute(
                    "update libri set quantita = libri.quantita + 1 where isbn = %s",
                    (libro.isbn,),
                )
                await db.commit()
            return JSONResponse(
                {
                    "message": "The Book is already in the database and the inventory has been updated"
                },
                201,
            )

        id_collocazione = await insert_collocazione(collocazione)
        id_libro = await insert_libro(libro, id_collocazione)

        for author in authors:
            id_autore = await insert_autore(author)
            await insert_libro_autori(id_libro, id_autore)
        if thumbnail:
            await upload_thumbnail(thumbnail, id_libro)
        log.info(f"Book '{libro.titolo}' inserted successfully into the database.")
        return JSONResponse({"status": "successful"}, 201)

    except InvalidRequestError as e:
        log.error(f"Invalid request: {e}.")
        raise HTTPException(status_code=400, detail=str(e))
    except DatabaseError as e:
        log.error(f"Database error: {e}.")
        raise HTTPException(status_code=500, detail="database error")
    except Exception as e:
        log.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error")
