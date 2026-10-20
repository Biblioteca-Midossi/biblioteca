"""Books endpoints implemented on top of the generated BaseBooksApi."""

import json
import os
from typing import Annotated

import psycopg
from biblioteca_api.apis.books_api_base import BaseBooksApi
from biblioteca_api.models.book_detail_response import BookDetailResponse
from biblioteca_api.models.books_list_response import BooksListResponse
from biblioteca_api.models.message_response import MessageResponse
from biblioteca_api.models.recent_books_list_response import RecentBooksListResponse
from fastapi import HTTPException, UploadFile
from pydantic import Field

from api.impl._security import get_payload, require_permission
from api.lib.database import PSQLDatabase
from api.lib.logger import log
from api.models.requests import CollocazioneData, CreateBookPayload, UpdateBookPayload
from api.models.responses import BookResponse
from api.models.rows import BookDetailRow, BookListRow, BookThumbnailRow, RecentBookRow
from api.services.db_operations import insert_book_into_database, insert_collocazione
from api.services.file_operations import convert_to_png


class BooksImpl(BaseBooksApi):
    async def get_books(
        self,
        page: int | None,
        limit: int | None,
        search: str | None,
    ) -> BooksListResponse:
        page = page or 1
        limit = limit or 12
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
                cursor.execute(base_query.replace("-- WHERE_CLAUSE", ""), (limit, limit, offset))

            raw_books = db.fetchall_as(BookListRow)

        if not raw_books:
            raise HTTPException(status_code=204, detail="Books not found")

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

    async def create_book(
        self,
        data: Annotated[str, Field(description="JSON string matching CreateBookPayload")],
        thumbnail: UploadFile | None,
    ) -> MessageResponse:
        payload = await get_payload()
        require_permission(payload, "create_book")
        try:
            book_payload = CreateBookPayload.model_validate(json.loads(data))
            await insert_book_into_database(book_payload, thumbnail)
            return MessageResponse(message="Libro creato con successo")
        except HTTPException:
            raise
        except Exception as e:
            log.error(f"Errore imprevisto durante la creazione del libro: {e}")
            raise HTTPException(status_code=500, detail="Errore interno del server") from e

    async def get_recent_books(self, limit: int | None) -> RecentBooksListResponse:
        limit = limit or 5
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

        from biblioteca_api.models.recent_book_response import RecentBookResponse

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

    async def get_book(self, book_id: int) -> BookDetailResponse:
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

    async def update_book(
        self,
        book_id: int,
        updated_book: str | None,
        file: UploadFile | None,
    ) -> MessageResponse:
        payload = await get_payload()
        require_permission(payload, "edit_book")
        try:
            if not updated_book:
                raise HTTPException(
                    status_code=400,
                    detail="Campo 'updatedBook' mancante nel form",
                )
            data = UpdateBookPayload.model_validate(json.loads(updated_book))

            with PSQLDatabase() as db:
                cursor = db.get_cursor()

                # Check if book exists
                cursor.execute("SELECT 1 FROM LIBRI WHERE id_libro = %s", (book_id,))
                if not cursor.fetchone():
                    raise HTTPException(status_code=404, detail="Libro non trovato")

                update_fields: dict[str, object] = {}
                field_map = {
                    "isbn": "isbn",
                    "titolo": "titolo",
                    "quantita": "quantita",
                    "casa_editrice": "casa_editrice",
                    "descrizione": "descrizione",
                }
                for attr, db_col in field_map.items():
                    val = getattr(data, attr, None)
                    if val is not None:
                        update_fields[db_col] = val

                if data.genere is not None:
                    genres = data.genere if isinstance(data.genere, list) else [data.genere]
                    self._replace_genres(cursor, book_id, genres)

                if data.nome_autore is not None and data.cognome_autore is not None:
                    self._replace_authors(cursor, book_id, data.nome_autore, data.cognome_autore)

                if data.istituto is not None or data.scaffale is not None:
                    cursor.execute(
                        """
                        SELECT c.istituto, c.scaffale
                        FROM libri l
                        LEFT JOIN collocazioni c ON l.id_collocazione = c.id_collocazione
                        WHERE l.id_libro = %s
                        """,
                        (book_id,),
                    )
                    current = cursor.fetchone()
                    istituto = (
                        data.istituto
                        if data.istituto is not None
                        else (current[0] if current else None)
                    )
                    scaffale = (
                        data.scaffale
                        if data.scaffale is not None
                        else (current[1] if current else None)
                    )
                    id_collocazione = insert_collocazione(
                        CollocazioneData(istituto=istituto or "", scaffale=scaffale or "")
                    )
                    cursor.execute(
                        "UPDATE libri SET id_collocazione = %s WHERE id_libro = %s",
                        (id_collocazione, book_id),
                    )

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
                    await self._save_thumbnail(cursor, book_id, file)

                db.commit()
                log.info(f"Libro {book_id} aggiornato con successo")
                return MessageResponse(message="Libro aggiornato con successo")

        except psycopg.Error as e:
            log.error(f"Errore database durante l'aggiornamento del libro: {e}")
            raise HTTPException(status_code=400, detail=f"Errore database: {e}") from e
        except HTTPException:
            raise
        except Exception as e:
            log.error(f"Errore imprevisto durante l'aggiornamento del libro: {e}")
            raise HTTPException(status_code=500, detail="Errore interno del server") from e

    async def delete_book(self, book_id: int) -> MessageResponse:
        payload = await get_payload()
        require_permission(payload, "delete_book")
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
            raise HTTPException(status_code=500, detail=f"Errore database: {e}") from e
        except HTTPException:
            raise
        except Exception as e:
            log.error(f"Errore imprevisto durante l'eliminazione del libro: {e}")
            raise HTTPException(status_code=500, detail="Errore interno del server") from e

    @staticmethod
    def _replace_genres(cursor: psycopg.Cursor, book_id: int, genres: list[str]) -> None:
        cursor.execute("DELETE FROM libro_generi WHERE id_libro = %s", (book_id,))
        for genre in genres:
            # Find existing genre id
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
                    "INSERT INTO generi (nome_genere) VALUES (%s) RETURNING id_genere",
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

    @staticmethod
    def _replace_authors(
        cursor: psycopg.Cursor,
        book_id: int,
        names: list[str],
        surnames: list[str],
    ) -> None:
        nome_list = [n.strip() for n in names]
        cognome_list = [s.strip() for s in surnames]

        if len(nome_list) != len(cognome_list):
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
        seen: set[tuple[int, int]] = set()

        for nome, cognome in zip(nome_list, cognome_list, strict=False):
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

    @staticmethod
    async def _save_thumbnail(cursor: psycopg.Cursor, book_id: int, file: UploadFile) -> None:
        save_dir = "./uploads/thumbnails/"
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
