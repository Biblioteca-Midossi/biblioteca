"""Auth endpoints implemented on top of the generated BaseAuthApi."""

from datetime import UTC, datetime, timedelta

import bcrypt
from biblioteca_api.apis.auth_api_base import BaseAuthApi
from biblioteca_api.models.login_request import LoginRequest
from biblioteca_api.models.message_response import MessageResponse
from biblioteca_api.models.register_request import RegisterRequest
from fastapi import HTTPException, Response
from fastapi.responses import JSONResponse

from api.auth import auth
from api.auth.helpers import (
    check_user_exists,
    create_user,
    fetch_user_for_login,
    fetch_user_permissions,
    generate_refresh_token,
    hash_token,
)
from api.impl._security import get_active_request
from api.lib.database import PSQLDatabase
from api.lib.logger import log


def _message_response(message: str, status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        MessageResponse(message=message).model_dump(by_alias=True),
        status_code,
    )


class AuthImpl(BaseAuthApi):
    async def register(self, register_request: RegisterRequest) -> MessageResponse:
        try:
            if check_user_exists(
                register_request.username,
                str(register_request.email),
            ):
                raise HTTPException(status_code=400, detail="Username o email già in uso")

            hashed = bcrypt.hashpw(
                register_request.password.encode(),
                bcrypt.gensalt(),
            ).decode()
            create_user(register_request, hashed)
            return JSONResponse(
                MessageResponse(message="Registrazione avvenuta con successo").model_dump(
                    by_alias=True
                ),
                201,
            )
        except HTTPException:
            raise
        except Exception as e:
            log.error(f"Errore durante la registrazione: {e}")
            raise HTTPException(status_code=500, detail="Internal server error") from e

    async def login(self, login_request: LoginRequest) -> MessageResponse:
        try:
            row = fetch_user_for_login(login_request.login)
            if not row or not bcrypt.checkpw(
                login_request.password.encode(),
                row.password.encode(),
            ):
                raise HTTPException(status_code=401, detail="Credenziali non valide")

            uid = str(row.id)
            permissions = fetch_user_permissions(row.id)

            extra = {
                "role_id": row.role_id,
                "role_name": row.role_name,
                "permissions": permissions,
                "istituto": row.istituto,
            }

            access_token = auth.create_access_token(uid=uid, data=extra)

            # Generate refresh token and store it in the sessions table
            refresh_token_str = generate_refresh_token()
            token_hash = hash_token(refresh_token_str)
            expires_at = datetime.now(UTC) + timedelta(seconds=auth.refresh_max_age())

            with PSQLDatabase() as db:
                cursor = db.get_cursor()
                cursor.execute(
                    "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (%s, %s, %s)",
                    (row.id, token_hash, expires_at),
                )
                # Update last_login
                cursor.execute("UPDATE utenti SET last_login = NOW() WHERE id = %s", (row.id,))
                db.commit()

            resp = _message_response("Login effettuato con successo")
            auth.set_access_cookies(access_token, resp, max_age=auth.access_max_age())
            auth.set_refresh_cookies(refresh_token_str, resp, max_age=auth.refresh_max_age())
            return resp
        except HTTPException:
            raise
        except Exception as e:
            log.error(f"Errore durante il login: {e}")
            raise HTTPException(status_code=500, detail="Internal server error") from e

    async def refresh(self) -> MessageResponse:
        try:
            request = get_active_request()
            refresh_token = request.cookies.get("refresh_token")
            if not refresh_token:
                raise HTTPException(status_code=401, detail="Refresh token mancante")

            token_hash = hash_token(refresh_token)

            with PSQLDatabase() as db:
                cursor = db.get_cursor()
                cursor.execute(
                    "SELECT user_id, revoked, expires_at FROM sessions WHERE token_hash = %s",
                    (token_hash,),
                )
                row = cursor.fetchone()
                if not row:
                    raise HTTPException(status_code=401, detail="Refresh token non valido")

                user_id, revoked, expires_at = row

                if revoked or expires_at < datetime.now(UTC):
                    raise HTTPException(
                        status_code=401,
                        detail="Refresh token non valido o scaduto",
                    )

                # Rotate: revoke old session
                cursor.execute(
                    "UPDATE sessions SET revoked = TRUE WHERE token_hash = %s",
                    (token_hash,),
                )

                # Create new refresh token
                new_refresh = generate_refresh_token()
                new_hash = hash_token(new_refresh)
                new_expires = datetime.now(UTC) + timedelta(seconds=auth.refresh_max_age())
                cursor.execute(
                    "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (%s, %s, %s)",
                    (user_id, new_hash, new_expires),
                )
                db.commit()

            # Fetch user info for the new access token
            permissions = fetch_user_permissions(user_id)

            with PSQLDatabase() as db:
                cursor = db.get_cursor()
                cursor.execute(
                    """
                    SELECT u.role_id, r.name AS role_name, u.istituto
                    FROM utenti u
                    JOIN roles r ON u.role_id = r.id
                    WHERE u.id = %s
                    """,
                    (user_id,),
                )
                user_row = cursor.fetchone()
                if not user_row:
                    raise HTTPException(status_code=401, detail="Utente non trovato")

                role_id, role_name, istituto = user_row

            extra = {
                "role_id": role_id,
                "role_name": role_name,
                "permissions": permissions,
                "istituto": istituto,
            }
            new_access = auth.create_access_token(uid=str(user_id), data=extra)

            resp = _message_response("Token aggiornato con successo")
            auth.set_access_cookies(new_access, resp, max_age=auth.access_max_age())
            auth.set_refresh_cookies(new_refresh, resp, max_age=auth.refresh_max_age())
            return resp
        except HTTPException:
            raise
        except Exception as e:
            log.error(f"Errore durante il refresh del token: {e}")
            raise HTTPException(status_code=401, detail="Refresh token non valido") from e

    async def logout(self) -> MessageResponse:
        request = get_active_request()
        response = Response()
        refresh_token = request.cookies.get("refresh_token")
        if refresh_token:
            token_hash = hash_token(refresh_token)
            with PSQLDatabase() as db:
                cursor = db.get_cursor()
                cursor.execute(
                    "UPDATE sessions SET revoked = TRUE WHERE token_hash = %s",
                    (token_hash,),
                )
                db.commit()
        auth.unset_cookies(response)
        return MessageResponse(message="Logout effettuato con successo")
