from typing import Optional
from authx import TokenPayload
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    Query,
    Request,
)

from api.lib.logger import log
from api.models.auth import UserProfileUpdate
from api.models.responses import (
    MessageResponse,
    UserListItem,
    UserProfileOut,
    UsersListResponse,
    UsersRecentListResponse,
)
from api.models.requests import UpdateUserPayload
from api.models.rows import UserListRow
from api.services.file_operations import upload_profile_picture
from api.services.user_service import get_user_profile, update_user_profile
from api.auth import auth
from api.lib.database import PSQLDatabase

router = APIRouter(
    prefix="/users", tags=["users"], responses={404: {"description": "Not found"}}
)


class RequireRole:
    def __init__(self, minimum_role: int):
        self.minimum_role = minimum_role

    async def __call__(
        self, payload: TokenPayload = Depends(auth.access_token_required)
    ):
        extra = payload.model_extra or {}
        log.info(extra)
        ruolo = extra.get("ruolo", 0)
        if int(ruolo) < self.minimum_role:
            raise HTTPException(status_code=403, detail="Permessi insufficienti")
        return payload


@router.get("/me", response_model=UserProfileOut)
async def get_profile(payload: TokenPayload = Depends(auth.access_token_required)) -> UserProfileOut:
    profile = await get_user_profile(int(payload.sub))
    if not profile:
        raise HTTPException(status_code=404, detail="Utente non trovato")

    return UserProfileOut(
        id=profile.id,
        username=profile.username,
        email=profile.email,
        nome=profile.nome,
        cognome=profile.cognome,
        istituto=profile.istituto,
        ruolo=profile.ruolo,
        bio=profile.bio,
        profile_picture=profile.profile_picture,
        last_login=profile.last_login,
    )


@router.put("/me", response_model=MessageResponse)
async def update_profile(
    payload: TokenPayload = Depends(auth.access_token_required),
    profile_update: Optional[UserProfileUpdate] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    user_id = int(payload.sub)
    update_data = {}

    # Handle file upload if needed
    if file and file.filename and file.size:
        if file.content_type not in [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
        ]:
            raise HTTPException(
                status_code=400,
                detail="Tipo di file non valido. Sono accettati solo JPEG, PNG, WEBP e GIF",
            )

        if file.size > 5_000_000:  # 5MB
            raise HTTPException(
                status_code=400, detail="Il file non può superare i 5MB"
            )

        # Upload new file picture
        await upload_profile_picture(user_id, file)

        with PSQLDatabase() as db:
            cursor = db.get_cursor()
            cursor.execute(
                "select profile_picture from utenti where id = %s",
                (user_id,),
            )
            row = cursor.fetchone()
        update_data["profile_picture"] = row[0] if row else None

    if profile_update:
        profile_dict = profile_update.model_dump(mode="python", exclude_unset=True)
        update_data.update(profile_dict)

    if not update_data:
        raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")

    try:
        await update_user_profile(user_id, update_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return MessageResponse(message="Profilo aggiornato con successo")


@router.get("/get-users", response_model=UsersListResponse, dependencies=[Depends(RequireRole(3))])
async def get_users(
    offset: int = Query(default=0, ge=0), limit: int = Query(default=10, ge=1, le=100)
):
    with PSQLDatabase() as db:
        cursor = db.get_cursor()

        cursor.execute("SELECT COUNT(*) FROM utenti")
        total_users = cursor.fetchone()[0]

        cursor.execute(
            """
            SELECT id, nome, cognome, username, ruolo, istituto, email
            FROM utenti
            ORDER BY id
            LIMIT %s OFFSET %s
            """,
            (limit, offset),
        )
        users_raw = db.fetchall_as(UserListRow)

    if not users_raw:
        return MessageResponse(message="Nessun utente trovato")

    users = [
        UserListItem(
            id=user.id,
            nome=user.nome,
            cognome=user.cognome,
            username=user.username,
            ruolo=user.ruolo,
            istituto=user.istituto,
            email=user.email,
        )
        for user in users_raw
    ]
    return UsersListResponse(users=users, total=total_users)


@router.get("/recent", response_model=UsersRecentListResponse, dependencies=[Depends(RequireRole(3))])
async def get_recent_users(limit: int = Query(default=5, ge=1, le=100)) -> UsersRecentListResponse | MessageResponse:
    """Return the most recent users by taking the highest id values.
    Protected to role >= 3 to match existing users listing.
    """
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            """
            SELECT id, nome, cognome, username, ruolo, istituto, email
            FROM utenti
            ORDER BY id DESC
            LIMIT %s
            """,
            (limit,),
        )
        users_raw = db.fetchall_as(UserListRow)

    if not users_raw:
        return MessageResponse(message="Nessun utente trovato")

    users = [
        UserListItem(
            id=user.id,
            nome=user.nome,
            cognome=user.cognome,
            username=user.username,
            ruolo=user.ruolo,
            istituto=user.istituto,
            email=user.email,
        )
        for user in users_raw
    ]
    return UsersRecentListResponse(users=users)


@router.put("/update-user/{user_id}", response_model=MessageResponse)
async def update_user(
    user_id: int,
    request: Request,
    payload: TokenPayload = Depends(auth.access_token_required),
):
    current_role = int((payload.model_extra or {}).get("ruolo", 0))
    current_user_id = int(payload.sub)

    body = await request.json()
    user_data_raw: dict = body.get("user_data", {}) if isinstance(body, dict) else {}
    user_data = UpdateUserPayload.model_validate(user_data_raw)

    # Fetch the target user's current role
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            "SELECT ruolo FROM utenti WHERE id = %s",
            (user_id,),
        )
        result = cursor.fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Utente non trovato")

    target_role = result[0]

    if user_id == current_user_id and user_data.ruolo is not None:
        raise HTTPException(
            status_code=403,
            detail="Non puoi modificare il tuo stesso ruolo",
        )

    if target_role >= current_role:
        raise HTTPException(
            status_code=403,
            detail="Non puoi modificare utenti con ruolo uguale o superiore al tuo",
        )

    if user_data.ruolo is not None and int(user_data.ruolo) >= current_role:
        raise HTTPException(
            status_code=403,
            detail="Non puoi assegnare un ruolo uguale o superiore al tuo",
        )

    allowed_fields = {"nome", "cognome", "username", "ruolo", "email"}
    update_fields = []
    values = []
    for key, value in user_data.model_dump(exclude_unset=True).items():
        if key in allowed_fields:
            update_fields.append(f"{key} = %s")
            values.append(value)

    if not update_fields:
        raise HTTPException(status_code=400, detail="Nessun campo valido da aggiornare")

    values.append(user_id)

    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            f"UPDATE utenti SET {', '.join(update_fields)} WHERE id = %s RETURNING id",
            tuple(values),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Utente non trovato")
        db.commit()

    # TODO NOTE: with JWT there is no live token store to update.
    # Role changes take effect the next time the user logs in
    # (or when their current token expires). This is the standard JWT trade-off.
    # A token blocklist feature in authx-extra should be added later on.

    return MessageResponse(message="Utente aggiornato con successo")
