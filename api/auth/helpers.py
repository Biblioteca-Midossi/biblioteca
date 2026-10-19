import hashlib
import secrets

from authx import TokenPayload
from fastapi import Depends, HTTPException

from api.auth import auth
from api.lib.database import PSQLDatabase
from api.models.auth import RegisterRequest
from api.models.rows import UserLoginRow


def is_email(value: str) -> bool:
    return "@" in value


def fetch_user_for_login(login: str) -> UserLoginRow | None:
    field = "email" if is_email(login) else "username"
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            f"""
            SELECT u.id, u.password, u.role_id, r.name AS role_name, u.istituto, u.username
            FROM utenti u
            JOIN roles r ON u.role_id = r.id
            WHERE u.{field} = %s
            """,
            (login,),
        )
        return db.fetchone_as(UserLoginRow)


def fetch_user_permissions(user_id: int) -> list[str]:
    """Return all permission names for a user.
    Admin role bypass — returns every permission."""
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        # Check role
        cursor.execute(
            "SELECT r.name FROM utenti u JOIN roles r ON u.role_id = r.id WHERE u.id = %s",
            (user_id,),
        )
        role_row = cursor.fetchone()
        if not role_row:
            return []
        role_name = role_row[0]

        # Admin gets every permission
        if role_name == "admin":
            cursor.execute("SELECT name FROM permissions")
            return [row[0] for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT p.name
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN utenti u ON u.role_id = rp.role_id
            WHERE u.id = %s
            """,
            (user_id,),
        )
        return [row[0] for row in cursor.fetchall()]


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
            INSERT INTO utenti(nome, cognome, username, email, password, istituto, role_id)
            VALUES (%s, %s, %s, %s, %s, %s, (SELECT id FROM roles WHERE name = 'utente'))
            """,
            (
                data.nome,
                data.cognome,
                data.username,
                str(data.email),
                hashed_password,
                data.istituto.value,
            ),
        )
        db.commit()


# ─── Session / Token helpers ────────────────────────────────────────────────


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def generate_refresh_token() -> str:
    return secrets.token_hex(32)


# ─── Permission dependencies ────────────────────────────────────────────────


def require_permission(permission: str):
    """FastAPI dependency: require a specific named permission."""

    async def checker(payload: TokenPayload = Depends(auth.access_token_required)):
        user_id = int(payload.sub)
        perms = fetch_user_permissions(user_id)
        if permission not in perms:
            raise HTTPException(status_code=403, detail="Permessi insufficienti")
        return payload

    return checker
