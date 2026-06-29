import bcrypt
from authx import TokenPayload
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from starlette.responses import Response

from api.models.auth import LoginRequest
from api.auth.helpers import check_user_exists, create_user, fetch_user_for_login
from api.auth import auth
from api.services.user_service import get_user_by_id

from api.models.auth import RegisterRequest
from api.lib.database import PSQLDatabase
from api.lib.logger import log
from api.models.responses import MessageResponse


router = APIRouter(
    prefix="/auth", tags=["auth"], responses={404: {"description": "Not found"}}
)


@router.post("/register", status_code=201, response_model=MessageResponse)
async def register(data: RegisterRequest) -> MessageResponse:
    try:
        if check_user_exists(data.username, str(data.email)):
            raise HTTPException(status_code=400, detail="Username o email già in uso")

        hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
        create_user(data, hashed)
        return MessageResponse(message="Registrazione avvenuta con successo")

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Errore durante la registrazione: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/login", response_model=MessageResponse)
async def login(data: LoginRequest):
    try:
        row = fetch_user_for_login(data.login)

        if not row or not bcrypt.checkpw(
            data.password.encode(), row.password.encode()
        ):
            raise HTTPException(status_code=401, detail="Credenziali non valide")

        uid = str(row.id)
        extra = {"ruolo": row.ruolo, "istituto": row.istituto}

        access_token = auth.create_access_token(uid=uid, data=extra)
        refresh_token = auth.create_refresh_token(uid=uid)

        resp = JSONResponse(MessageResponse(message="Login effettuato con successo").model_dump(by_alias=True), 200)

        auth.set_access_cookies(access_token, resp, max_age=auth.access_max_age())
        auth.set_refresh_cookies(refresh_token, resp, max_age=auth.refresh_max_age())

        # update last_login
        with PSQLDatabase() as db:
            db.get_cursor().execute(
                "UPDATE utenti SET last_login = NOW() WHERE id = %s", (row.id,)
            )
            db.commit()

        return resp

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Errore durante il login: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/refresh", response_model=MessageResponse)
async def refresh(payload: TokenPayload = Depends(auth.refresh_token_required)):
    try:
        user = await get_user_by_id(int(payload.sub))
        if not user:
            raise HTTPException(status_code=401, detail="Refresh token non valido")

        extra = {"ruolo": user.ruolo, "istituto": user.istituto}
        new_access = auth.create_access_token(uid=payload.sub, data=extra)
        resp = JSONResponse(MessageResponse(message="Token aggiornato con successo").model_dump(by_alias=True), 200)

        auth.set_access_cookies(new_access, resp, max_age=auth.access_max_age())
        return resp

    except Exception as e:
        log.error(f"Errore durante il refresh del token: {e}")
        raise HTTPException(status_code=401, detail="Refresh token non valido")


@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response):
    auth.unset_cookies(response)
    return MessageResponse(message="Logout effettuato successo")
