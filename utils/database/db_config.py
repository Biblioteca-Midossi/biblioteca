import os
from typing import Dict, Optional
from utils.env import get_env
from utils.Logger import log


if os.path.exists(".env"):
    try:
        psql_host = get_env("POSTGRES_HOST")
        psql_database = get_env("POSTGRES_DB")
        psql_user = get_env("POSTGRES_USER")
        psql_password = get_env("POSTGRES_PASSWORD")
        psql_port = get_env("POSTGRES_PORT")
        psql_options = f"-c search_path={get_env('POSTGRES_SCHEMA')}"

        redis_host = get_env("DRAGONFLY_HOST")
        redis_port = get_env("DRAGONFLY_PORT")
        redis_password = get_env("DRAGONFLY_PASSWORD")

    except Exception:
        log.error("Your .env is not complete. Try checking for missing fields")
        raise Exception("Your .env is not complete. Try checking for missing fields")
else:
    log.error("No .env found at project root")
    raise Exception("No .env found at project root")

psql_config: Dict[str, Optional[str]] = {
    "dbname": psql_database,
    "user": psql_user,
    "password": psql_password,
    "host": psql_host,
    "port": psql_port,
    "options": psql_options,
}

redis_config: Dict[str, Optional[str | bool | int]] = {
    "host": redis_host,
    "port": redis_port,
    "password": redis_password,
    "decode_responses": True,
    "protocol": 3,
}
