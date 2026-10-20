import hashlib
import secrets

from authx import TokenPayload
from fastapi import Depends, HTTPException

from api.auth import auth
from api.lib.database import PSQLDatabase
from api.models.auth import RegisterRequest
from api.models.rows import (
    PermissionNameRow,
    RoleNameRow,
    UserLoginRow,
)


def is_email(value: str) -> bool:
    return "@" in value


async def fetch_user_for_login(login: str) -> UserLoginRow | None:
    field = "email" if is_email(login) else "username"
    async with PSQLDatabase() as db:
        return await db.fetchone_as(
            UserLoginRow,
            f"""
            SELECT u.id, u.password, u.role_id, r.name AS role_name, u.istituto, u.username
            FROM utenti u
            JOIN roles r ON u.role_id = r.id
            WHERE u.{field} = %s
            """,
            (login,),
        )


async def fetch_user_permissions(user_id: int) -> list[str]:
    """Return all permission names for a user.
    Admin role bypass — returns every permission."""
    async with PSQLDatabase() as db:
        role_row = await db.fetchone_as(
            RoleNameRow,
            "SELECT r.name FROM utenti u JOIN roles r ON u.role_id = r.id WHERE u.id = %s",
            (user_id,),
        )
        if not role_row:
            return []

        # Admin gets every permission
        if role_row.name == "admin":
            rows = await db.fetchall_as(PermissionNameRow, "SELECT name FROM permissions")
            return [row.name for row in rows]

        rows = await db.fetchall_as(
            PermissionNameRow,
            """
            SELECT p.name
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN utenti u ON u.role_id = rp.role_id
            WHERE u.id = %s
            """,
            (user_id,),
        )
        return [row.name for row in rows]


async def check_user_exists(username: str, email: str) -> bool:
    async with PSQLDatabase() as db:
        count = await db.fetch_scalar(
            "SELECT COUNT(*) FROM utenti WHERE username = %s OR email = %s",
            (username, email),
        )
        return count > 0


async def create_user(data: RegisterRequest, hashed_password: str) -> None:
    async with PSQLDatabase() as db:
        await db.execute(
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
        await db.commit()


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
        perms = await fetch_user_permissions(user_id)
        if permission not in perms:
            raise HTTPException(status_code=403, detail="Permessi insufficienti")
        return payload

    return checker
