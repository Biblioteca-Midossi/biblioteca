import os
from pathlib import Path
from typing import Dict, Optional

from dotenv import load_dotenv

from api.lib.logger import log


log.info("Trying to load environment variables")
if Path(".env").exists():
    log.info(".env file found!")
    load_dotenv(".env")


try:
    psql_host = os.getenv("POSTGRES_HOST")
    psql_database = os.getenv("POSTGRES_DB")
    psql_user = os.getenv("POSTGRES_USER")
    psql_password = os.getenv("POSTGRES_PASSWORD")
    psql_port = os.getenv("POSTGRES_PORT")
    psql_options = f"-c search_path={os.getenv('POSTGRES_SCHEMA')}"

except Exception:
    log.error("Your .env is not complete. Try checking for missing fields")
    raise Exception("Your .env is not complete. Try checking for missing fields")

psql_config: Dict[str, Optional[str]] = {
    "dbname": psql_database,
    "user": psql_user,
    "password": psql_password,
    "host": psql_host,
    "port": psql_port,
    "options": psql_options,
}

log.info(psql_config)
