from api.models.auth import RegisterRequest
from api.lib.database import PSQLDatabase
from api.models.rows import UserLoginRow


def is_email(value: str) -> bool:
    return "@" in value


def fetch_user_for_login(login: str) -> UserLoginRow | None:
    field = "email" if is_email(login) else "username"
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            f"""
            SELECT id, password, ruolo, istituto, username
            FROM utenti WHERE {field} = %s
            """,
            (login,),
        )
        return db.fetchone_as(UserLoginRow)


def check_user_exists(username: str, email: str) -> bool:
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            "SELECT 1 FROM utenti WHERE username = %s OR email = %s",
            (username, email),
        )
        return cursor.fetchone() is not None


def create_user(data: RegisterRequest, hashed_password: str) -> None:
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            """
            INSERT INTO utenti(nome, cognome, username, email, password, istituto, ruolo)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data.nome,
                data.cognome,
                data.username,
                str(data.email),
                hashed_password,
                data.istituto.value,
                0,
            ),
        )
        db.commit()
