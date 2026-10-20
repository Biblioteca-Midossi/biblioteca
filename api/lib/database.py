import os
from typing import TypeVar

import bcrypt
import psycopg
from psycopg import AsyncConnection
from psycopg.rows import class_row
from psycopg_pool import AsyncConnectionPool
from pydantic import BaseModel

from api.lib.config import psql_config
from api.lib.logger import log

M = TypeVar("M", bound=BaseModel)

log.info("Creating async connection pool for postgres..")
# Not opened here: opening an async pool requires a running event loop,
# and importing this module must not depend on one. Opened lazily in
# PSQLDatabase.__aenter__ on first use.
psql_pool = AsyncConnectionPool(kwargs=psql_config, min_size=1, max_size=4, open=False)


async def _ensure_pool_open():
    if psql_pool.closed:
        await psql_pool.open()


class PSQLDatabase:
    """Async database context manager.

    Usage:
        async with PSQLDatabase() as db:
            await db.execute(sql, params)
            row = await db.fetchone_as(Model, sql, params)
    """

    def __init__(self):
        self.conn: AsyncConnection | None = None
        self.cursor: psycopg.AsyncCursor | None = None

    async def __aenter__(self) -> "PSQLDatabase":
        await _ensure_pool_open()
        try:
            self.conn = await psql_pool.getconn()
        except psycopg.Error as pool_error:
            log.error(f"Error while getting a connection from the pool: {pool_error}")
            raise

        try:
            if self.conn:
                self.cursor = self.conn.cursor()
        except psycopg.Error as cursor_error:
            log.error(f"Error while getting the cursor from the connection: {cursor_error}")
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            await self.rollback()
        else:
            await self.commit()
        await self.close()
        return False

    async def close(self):
        try:
            if self.cursor:
                await self.cursor.close()
            if self.conn:
                await psql_pool.putconn(self.conn)
        except psycopg.Error as close_error:
            log.error(f"Error while closing the cursor or the connection: {close_error}")

    async def commit(self):
        try:
            if self.conn:
                await self.conn.commit()
        except psycopg.Error as commit_error:
            log.error(f"Error while committing changes to the database: {commit_error}")

    async def rollback(self):
        try:
            if self.conn:
                await self.conn.rollback()
        except psycopg.Error as rollback_error:
            log.error(f"Error while rolling back changes to the database: {rollback_error}")

    def get_cursor(self) -> psycopg.AsyncCursor:
        if self.cursor:
            return self.cursor
        raise Exception("No cursor available")

    async def execute(self, sql: str, params: tuple = ()) -> None:
        cursor = self.get_cursor()
        await cursor.execute(sql, params)

    async def fetchone_as[M: BaseModel](
        self, model: type[M], sql: str, params: tuple = ()
    ) -> M | None:
        if not self.conn:
            raise Exception("No connection available")
        async with self.conn.cursor(row_factory=class_row(model)) as cursor:
            await cursor.execute(sql, params)
            return await cursor.fetchone()

    async def fetchall_as[M: BaseModel](
        self, model: type[M], sql: str, params: tuple = ()
    ) -> list[M]:
        if not self.conn:
            raise Exception("No connection available")
        async with self.conn.cursor(row_factory=class_row(model)) as cursor:
            await cursor.execute(sql, params)
            return list(await cursor.fetchall())

    async def fetch_scalar(self, sql: str, params: tuple = ()) -> int:
        cursor = self.get_cursor()
        await cursor.execute(sql, params)
        row = await cursor.fetchone()
        if row is None:
            raise Exception("fetch_scalar: no result")
        return row[0]


async def ensure_admin():
    async with PSQLDatabase() as db:
        count = await db.fetch_scalar(
            """
            SELECT COUNT(*)
            FROM utenti u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'admin'
            """
        )
        if count > 0:
            log.info("Admin user already exists — skipping admin bootstrap.")
            return

        log.info("Admin user not found. Creating initial admin user")

        default_password = os.getenv("ADMIN_PASSWORD")
        if default_password:
            await db.execute(
                """INSERT INTO utenti(cognome, nome, istituto, role_id, password, username, email)
                   VALUES (%s, %s, %s, (SELECT id FROM roles WHERE name = 'admin'), %s, %s, %s)""",
                (
                    "Midossi",
                    "Biblioteca",
                    "ITT",
                    bcrypt.hashpw(default_password.encode(), bcrypt.gensalt()).decode(),
                    "support",
                    "support@localhost.com",
                ),
            )
            await db.commit()
