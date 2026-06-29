from fastapi import APIRouter, HTTPException, Path, UploadFile, File, Depends, Query
from fastapi.requests import Request
from fastapi.responses import JSONResponse

import json

import os

import psycopg

from typing import Annotated

from api.routes.users import RequireRole
from api.services.db_operations import insert_book_into_database
from api.services.file_operations import convert_to_png
from api.lib.database import PSQLDatabase
from api.lib.logger import log
from api.models.responses import (
    BookDetailResponse,
    BookResponse,
    BooksListResponse,
    MessageResponse,
    RecentBookResponse,
    RecentBooksListResponse,
)
from api.models.requests import CreateBookPayload, UpdateBookPayload
from api.models.rows import BookDetailRow, BookListRow, BookThumbnailRow, RecentBookRow


router = APIRouter(
    prefix="/books", tags=["books"], responses={404: {"description": "Not found"}}
)


@router.get("", response_model=BooksListResponse)
async def get_books(
    page: int = Query(1, alias="page"),
    limit: int = Query(12, alias="limit"),
    search: str | None = Query(None, alias="search"),
) -> BooksListResponse:
    offset = (page - 1) * limit

    base_query = """
        SELECT 
            l.id_libro,
            l.titolo,
            l.thumbnail_path,
            l.isbn,
            l.quantita,
            l.casa_editrice,
            l.descrizione,
            c.istituto,
            c.scaffale,
            ARRAY_REMOVE(ARRAY_AGG(DISTINCT g.nome_genere), NULL) AS generi,
            ARRAY_REMOVE(
                ARRAY_AGG(DISTINCT a.nome || ' ' || a.cognome), NULL
            ) AS autori,
            COUNT(*) OVER () AS total_count,
            CEIL(COUNT(*) OVER () * 1.0 / %s)::int AS maxpage
        FROM libri l
        LEFT JOIN collocazioni c ON l.id_collocazione = c.id_collocazione
        LEFT JOIN libro_autori la ON l.id_libro = la.id_libro
        LEFT JOIN autori a ON la.id_autore = a.id_autore
        LEFT JOIN libro_generi lg ON l.id_libro = lg.id_libro
        LEFT JOIN generi g ON lg.id_genere = g.id_genere
        -- WHERE_CLAUSE
        GROUP BY l.id_libro, c.istituto, c.scaffale
        ORDER BY l.id_libro
        LIMIT %s OFFSET %s
    """

    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        if search:
            where = """
                WHERE l.titolo ILIKE %s
                OR a.nome ILIKE %s
                OR a.cognome ILIKE %s
                OR g.nome_genere ILIKE %s
            """
            pattern = f"%{search}%"
            cursor.execute(
                base_query.replace("-- WHERE_CLAUSE", where),
                (limit, pattern, pattern, pattern, pattern, limit, offset),
            )
        else:
            cursor.execute(
                base_query.replace("-- WHERE_CLAUSE", ""), (limit, limit, offset)
            )

        raw_books = db.fetchall_as(BookListRow)

    if not raw_books:
        raise HTTPException(204, "Books not found")

    books = [
        BookResponse(
            id=book.id_libro,
            titolo=book.titolo,
            autori=book.autori,
            cover_url=book.thumbnail_path,
            isbn=book.isbn,
            genere=book.generi,
            quantita=book.quantita,
            casa_editrice=book.casa_editrice,
            descrizione=book.descrizione,
            istituto=book.istituto,
            scaffale=book.scaffale,
        )
        for book in raw_books
    ]

    maxpage = raw_books[0].maxpage if raw_books else 1

    return BooksListResponse(books=books, maxpage=maxpage)


@router.get("/recent", response_model=RecentBooksListResponse)
async def get_recent_books(limit: int = Query(5, alias="limit", ge=1, le=50)) -> RecentBooksListResponse:
    """Return the most recently added books by picking the highest id_libro values.
    The result is ordered by id_libro desc and limited by `limit`.
    """
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            """
            SELECT
                l.id_libro,
                l.titolo,
                l.thumbnail_path,
                l.isbn,
                l.quantita,
                l.casa_editrice,
                ARRAY_REMOVE(
                    ARRAY_AGG(DISTINCT a.nome || ' ' || a.cognome), NULL
                ) AS autori
            FROM libri l
            LEFT JOIN libro_autori la ON l.id_libro = la.id_libro
            LEFT JOIN autori a ON la.id_autore = a.id_autore
            GROUP BY l.id_libro
            ORDER BY l.id_libro DESC
            LIMIT %s
            """,
            (limit,),
        )

        raw_books = db.fetchall_as(RecentBookRow)

    if not raw_books:
        # Return empty list rather than 204 so frontend can render gracefully
        return RecentBooksListResponse(books=[])

    books = [
        RecentBookResponse(
            id=book.id_libro,
            titolo=book.titolo,
            autori=book.autori,
            cover_url=book.thumbnail_path,
            isbn=book.isbn,
            quantita=book.quantita,
            casa_editrice=book.casa_editrice,
        )
        for book in raw_books
    ]

    return RecentBooksListResponse(books=books)


@router.get("/{book_id}", response_model=BookDetailResponse)
async def get_book(book_id: int = Path(...)) -> BookDetailResponse:
    with PSQLDatabase() as db:
        cursor = db.get_cursor()

        # Fetch book details
        cursor.execute(
            """
            SELECT 
                l.id_libro,
                l.isbn,
                l.titolo,
                l.quantita,
                l.casa_editrice,
                l.thumbnail_path,
                c.istituto,
                c.scaffale,
                l.descrizione,
                ARRAY_REMOVE(ARRAY_AGG(DISTINCT g.nome_genere), NULL) as generi,
                ARRAY_REMOVE(
                    ARRAY_AGG(DISTINCT a.nome || ' ' || a.cognome), NULL
                ) AS autori
            FROM libri l
            LEFT JOIN collocazioni c ON l.id_collocazione = c.id_collocazione
            LEFT JOIN libro_autori la ON l.id_libro = la.id_libro
            LEFT JOIN autori a ON la.id_autore = a.id_autore
            LEFT JOIN libro_generi lg ON l.id_libro = lg.id_libro
            LEFT JOIN generi g ON lg.id_genere = g.id_genere
            WHERE l.id_libro = %s
            GROUP BY l.id_libro, c.istituto, c.scaffale
            """,
            (book_id,),
        )
        book = db.fetchone_as(BookDetailRow)

    if not book:
        raise HTTPException(404, "Book not found")

    log.info(f"Libro richiesto: {book_id}")
    return BookDetailResponse(
        book=BookResponse(
            id=book.id_libro,
            isbn=book.isbn,
            titolo=book.titolo,
            genere=book.generi,
            quantita=book.quantita,
            casa_editrice=book.casa_editrice,
            descrizione=book.descrizione,
            autori=book.autori,
            cover_url=book.thumbnail_path,
            istituto=book.istituto,
            scaffale=book.scaffale,
        )
    )


@router.post("", dependencies=[Depends(RequireRole(3))])
async def create_book(data: Request, thumbnail: UploadFile | None = File(None)):
    try:
        form_data = await data.form()
        data_str = form_data.get("data")

        if not data_str or not isinstance(data_str, str):
            raise HTTPException(
                status_code=400, detail="Campo 'data' mancante nel form"
            )

        payload = CreateBookPayload.model_validate(json.loads(data_str))

        response: JSONResponse = await insert_book_into_database(payload, thumbnail)
        return response

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Errore imprevisto durante la creazione del libro: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")


@router.put("/{book_id}", response_model=MessageResponse, dependencies=[Depends(RequireRole(3))])
async def update_book(
    updated_book: Request,
    book_id: int = Path(...),
    file: Annotated[UploadFile | None, File(...)] = None,
):
    try:
        form_data = await updated_book.form()
        data_str = form_data.get("updatedBook")

        if not data_str or not isinstance(data_str, str):
            raise HTTPException(
                status_code=400, detail="Campo 'updatedBook' mancante nel form"
            )

        data = UpdateBookPayload.model_validate(json.loads(data_str))

        with PSQLDatabase() as db:
            cursor = db.get_cursor()

            # Check if book exists
            cursor.execute("SELECT 1 FROM LIBRI WHERE id_libro = %s", (book_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Libro non trovato")

            update_fields = {}
            field_map = {
                "isbn": "isbn",
                "titolo": "titolo",
                "quantita": "quantita",
                "casaEditrice": "casa_editrice",
                "descrizione": "descrizione",
            }
            for json_key, db_col in field_map.items():
                val = getattr(data, json_key.replace("casaEditrice", "casa_editrice"), None)
                if val is not None:
                    update_fields[db_col] = val

            if data.genere is not None:
                # Remove existing genre associations
                cursor.execute(
                    "DELETE FROM libro_generi WHERE id_libro = %s", (book_id,)
                )

                # Ensure genres is a list
                genres = (
                    data.genere
                    if isinstance(data.genere, list)
                    else [data.genere]
                )

                for genre in genres:
                    # Find or insert genre
                    cursor.execute(
                        """
                        SELECT id_genere 
                        FROM generi
                        WHERE nome_genere = %s
                        """,
                        (genre,),
                    )
                    row = cursor.fetchone()
                    if row:
                        id_genere = row[0]
                    else:
                        cursor.execute(
                            """
                            INSERT INTO libro_generi (id_libro, id_genere)
                            VALUES (%s, %s) 
                            ON CONFLICT DO NOTHING
                            """,
                            (genre,),
                        )
                        id_genere = cursor.fetchone()[0]

                    cursor.execute(
                        """
                        INSERT INTO libro_generi (id_libro, id_genere)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                        """,
                        (book_id, id_genere),
                    )

            if data.nome_autore is not None and data.cognome_autore is not None:
                names = [n.strip() for n in data.nome_autore]
                surnames = [s.strip() for s in data.cognome_autore]

                if len(names) != len(surnames):
                    raise HTTPException(
                        status_code=400,
                        detail="Numero di nomi e cognomi degli autori non corrispondente",
                    )

                cursor.execute(
                    """
                    DELETE FROM libro_autori
                    WHERE id_libro = %s
                    """,
                    (book_id,),
                )
                seen = set()

                for nome, cognome in zip(names, surnames):
                    cursor.execute(
                        "SELECT id_autore FROM autori WHERE nome = %s AND cognome = %s",
                        (nome, cognome),
                    )
                    row = cursor.fetchone()
                    if row:
                        id_autore = row[0]
                    else:
                        cursor.execute(
                            "INSERT INTO autori (nome, cognome) VALUES (%s, %s) RETURNING id_autore",
                            (nome, cognome),
                        )
                        id_autore = cursor.fetchone()[0]

                    if (book_id, id_autore) not in seen:
                        cursor.execute(
                            "INSERT INTO libro_autori (id_libro, id_autore) VALUES (%s, %s)"
                            " ON CONFLICT DO NOTHING",
                            (book_id, id_autore),
                        )
                        seen.add((book_id, id_autore))

            # Construct and execute update query
            if update_fields:
                set_clause = ", ".join([f"{k} = %s" for k in update_fields])
                cursor.execute(
                    f"""
                    UPDATE libri 
                    SET {set_clause}
                    WHERE id_libro = %s
                    """,
                    (*update_fields.values(), book_id),
                )

            if file and file.filename:
                save_dir = "./assets/thumbnails/"
                existing = os.path.join(save_dir, f"{book_id}.png")

                # Delete existing file if it exists
                if os.path.exists(existing):
                    try:
                        os.remove(existing)
                    except Exception as e:
                        log.error(f"Errore eliminando thumbnail esistente: {e}")

                png_bytes = await convert_to_png(await file.read())
                os.makedirs(save_dir, exist_ok=True)
                file_path = os.path.join(save_dir, f"{book_id}.png")
                with open(file_path, "wb") as buffer:
                    buffer.write(png_bytes)

                cursor.execute(
                    """
                    UPDATE libri 
                    SET thumbnail_path = %s
                    WHERE id_libro = %s
                    """,
                    (file_path[2:], book_id),
                )

            db.commit()
            log.info(f"Libro {book_id} aggiornato con successo")
            return MessageResponse(message="Libro aggiornato con successo")

    except psycopg.Error as e:
        log.error(f"Errore database durante l'aggiornamento del libro: {e}")
        raise HTTPException(status_code=400, detail=f"Errore database: {e}")
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Errore imprevisto durante l'aggiornamento del libro: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")


@router.delete("/{book_id}", response_model=MessageResponse, dependencies=[Depends(RequireRole(3))])
async def delete_book(book_id: int = Path(...)):
    try:
        with PSQLDatabase() as db:
            cursor = db.get_cursor()

            cursor.execute(
                """
                SELECT thumbnail_path 
                FROM libri 
                WHERE id_libro = %s
                """,
                (book_id,),
            )
            book = db.fetchone_as(BookThumbnailRow)

            if not book:
                raise HTTPException(status_code=404, detail="Libro non trovato")

            if book.thumbnail_path:
                try:
                    os.remove(f"./{book.thumbnail_path}")
                except FileNotFoundError:
                    log.warning(f"Thumbnail non trovata: {book.thumbnail_path}")

            cursor.execute(
                """
                DELETE FROM libro_autori
                WHERE id_libro = %s
                """,
                (book_id,),
            )

            db.commit()

            log.info(f"Libro {book_id} eliminato con successo")
            return MessageResponse(message="Libro eliminato con successo")

    except psycopg.Error as e:
        log.error(f"Errore database durante l'eliminazione del libro: {e}")
        raise HTTPException(status_code=500, detail=f"Errore database: {e}")
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Errore imprevisto durante l'eliminazione del libro: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")
