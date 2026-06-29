import os
from typing import Any, TypeVar

import bcrypt
import psycopg
from psycopg_pool import ConnectionPool as PSQLConnectionPool
from pydantic import BaseModel

from api.lib.config import psql_config
from api.lib.logger import log


M = TypeVar("M", bound=BaseModel)


# on_startup()
log.info("Creating connection pool for postgres..")
psql_pool = PSQLConnectionPool(kwargs=psql_config, min_size=1, max_size=4)
psql_pool.wait()
log.info("Postgres pool successfully created.")


class PSQLDatabase:
    def __init__(self):
        self.conn: psycopg.Connection | None = None
        self.cursor: psycopg.Cursor | None = None

    def open(self):
        # getting a connection from the pool
        try:
            self.conn = psql_pool.getconn()
        except psycopg.Error as pool_error:
            log.error(f"Error while getting a connection from the pool: {pool_error}")
            raise

        # getting the cursor
        try:
            if self.conn:
                self.cursor = self.conn.cursor()
        except psycopg.Error as cursor_error:
            log.error(
                f"Error while getting the cursor from the connection: {cursor_error}"
            )
        return self.conn

    def close(self):
        try:
            if self.cursor:
                self.cursor.close()
            if self.conn:
                psql_pool.putconn(self.conn)
        except psycopg.Error as close_error:
            log.error(
                f"Error while closing the cursor or the connection: {close_error}"
            )

    def commit(self):
        try:
            if self.conn:
                self.conn.commit()
        except psycopg.Error as commit_error:
            print(f"Error while committing changes to the database: {commit_error}")
            log.error(f"Error while committing changes to the database: {commit_error}")

    def rollback(self):
        try:
            if self.conn:
                self.conn.rollback()
        except psycopg.Error as rollback_error:
            log.error(
                f"Error while committing changes to the database: {rollback_error}"
            )

    def get_cursor(self):
        if self.cursor:
            return self.cursor
        else:
            raise Exception("No cursor available")

    def fetchone_to_dict(self) -> dict[str, Any] | None:
        if self.cursor:
            row = self.cursor.fetchone()
            desc = self.cursor.description
            if not row or not desc:
                return None
            colnames = [col[0] for col in desc]
            return dict(zip(colnames, row))
        return None

    def fetchall_to_dict(self) -> list[dict[str, Any]] | None:
        if self.cursor:
            rows = self.cursor.fetchall()
            desc = self.cursor.description
            if not rows or not desc:
                return None
            colnames = [col[0] for col in desc]
            return [dict(zip(colnames, row)) for row in rows]
        return None

    def fetchone_as(self, model: type[M]) -> M | None:
        raw = self.fetchone_to_dict()
        if raw is None:
            return None
        return model.model_validate(raw)

    def fetchall_as(self, model: type[M]) -> list[M]:
        raw = self.fetchall_to_dict()
        if raw is None:
            return []
        return [model.model_validate(r) for r in raw]

    def __enter__(self) -> "PSQLDatabase":
        self.open()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.rollback()
        else:
            self.commit()
        self.close()
        return False


def check_admin():
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            """
            SELECT COUNT(*)
            FROM utenti
            WHERE ruolo = 4
            """
        )
        result = cursor.fetchone()

        if result and result[0] > 0:
            log.info("✅ Admin user already exists — skipping admin bootstrap.")
            return

        log.info("Admin user not found. Creating initial admin user")

        default_password = os.getenv("ADMIN_PASSWORD")
        log.info(f"Default password: {default_password}")
        if default_password:
            cursor.execute(
                """INSERT INTO utenti(cognome, nome, istituto, ruolo, password, username, email)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (
                    "Midossi",
                    "Biblioteca",
                    "ITT",
                    4,
                    bcrypt.hashpw(default_password.encode(), bcrypt.gensalt()).decode(),
                    "support",
                    "support@localhost.com",
                ),
            )
            db.commit()


check_admin()
