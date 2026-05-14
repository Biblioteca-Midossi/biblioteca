import psycopg
from psycopg_pool import ConnectionPool as PSQLConnectionPool
from redis.asyncio import Redis, ConnectionPool

from utils.database.db_config import psql_config, redis_config
from utils.env import get_env
from utils.Logger import log


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

    def fetchone_to_dict(self) -> dict | None:
        if self.cursor:
            row = self.cursor.fetchone()
            desc = self.cursor.description
            if not row or not desc:
                return None
            colnames = [col[0] for col in desc]
            return dict(zip(colnames, row))
        return None

    def fetchall_to_dict(self) -> list[dict] | None:
        if self.cursor:
            rows = self.cursor.fetchall()
            desc = self.cursor.description
            if not rows or not desc:
                return None
            colnames = [col[0] for col in desc]
            return [dict(zip(colnames, row)) for row in rows]
        return None

    def __enter__(self) -> "PSQLDatabase":
        self.open()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


def check_admin():
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute("""SELECT COUNT(*)FROM utenti WHERE ruolo = 4""")

        result = cursor.fetchone()

        if result and result[0] > 0:
            log.info("✅ Admin user already exists — skipping admin bootstrap.")
            return

        log.info("Admin user not found. Creating initial admin user")

        default_password = get_env("ADMIN_PASSWORD")
        log.info(f"Default password: {default_password}")
        if default_password:
            from utils.auth.auth_helper import hash_password

            cursor.execute(
                """INSERT INTO utenti(cognome, nome, id_istituto, ruolo, password, username, email)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (
                    "Midossi",
                    "Biblioteca",
                    1,
                    4,
                    hash_password(default_password).decode("utf8"),
                    "support",
                    "support@localhost.com",
                ),
            )
            db.commit()


check_admin()

log.info("Creating connection pool for redis..")
redis_pool = ConnectionPool(**redis_config)
log.info("Redis async pool successfully created.")


class RedisDatabase(Redis):
    def __init__(self):
        super().__init__(connection_pool=redis_pool)

    # async def hset(
    #     self,
    #     name: str,
    #     key: Optional[str] = None,
    #     value: Optional[str] = None,
    #     mapping: Optional[dict] = None,
    #     items: Optional[list] = None,
    # ):
    #     return await self.client.hset(name, key, value, mapping, items)
    #
    # async def expire(
    #     self,
    #     name: KeyT,
    #     time: ExpiryT,
    #     nx: bool = False,
    #     xx: bool = False,
    #     gt: bool = False,
    #     lt: bool = False,
    # ):
    #     return await self.client.expire(name, time, nx, xx, gt, lt)
    #
    # async def set(
    #     self,
    #     name: KeyT,
    #     value: EncodableT,
    #     ex: Union[ExpiryT, None] = None,
    #     px: Union[ExpiryT, None] = None,
    #     nx: bool = False,
    #     xx: bool = False,
    #     keepttl: bool = False,
    #     get: bool = False,
    #     exat: Union[AbsExpiryT, None] = None,
    #     pxat: Union[AbsExpiryT, None] = None,
    # ):
    #     return await self.client.set(name, value, ex, px, nx, xx, keepttl, get, exat, pxat)
    #
    # async def keys(self, pattern: PatternT = "*", **kwargs):
    #     return await self.client.keys(pattern, **kwargs)
    #
    # async def hgetall(self, name):
    #     return await self.client.hgetall(name)

    # async def __aenter__(self) -> 'RedisDatabase':
    #     return self
    #
    # async def __aexit__(self, exc_type, exc_val, exc_tb):
    #     await self.aclose()
