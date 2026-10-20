"""Users endpoints implemented on top of the generated BaseUsersApi."""

from biblioteca_api.apis.users_api_base import BaseUsersApi
from biblioteca_api.models.message_response import MessageResponse
from biblioteca_api.models.update_user_data import UpdateUserData
from biblioteca_api.models.update_user_request import UpdateUserRequest
from biblioteca_api.models.user_list_item import UserListItem
from biblioteca_api.models.user_profile_out import UserProfileOut
from biblioteca_api.models.users_list_response import UsersListResponse
from biblioteca_api.models.users_recent_list_response import UsersRecentListResponse
from fastapi import HTTPException, UploadFile

from api.auth.helpers import fetch_user_permissions
from api.impl._security import get_payload, require_permission
from api.lib.database import PSQLDatabase
from api.models.auth import UserProfileUpdate
from api.models.requests import UpdateUserPayload
from api.models.rows import UserListRow
from api.services.file_operations import upload_profile_picture
from api.services.user_service import get_user_profile, update_user_profile

ALLOWED_PROFILE_PICTURE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


def _user_list_item(user: UserListRow) -> UserListItem:
    return UserListItem(
        id=user.id,
        nome=user.nome,
        cognome=user.cognome,
        username=user.username,
        role_id=user.role_id,
        role_name=user.role_name,
        istituto=user.istituto,
        email=user.email,
    )


class UsersImpl(BaseUsersApi):
    async def get_profile(self) -> UserProfileOut:
        payload = await get_payload()
        profile = await get_user_profile(int(payload.sub))
        if not profile:
            raise HTTPException(status_code=404, detail="Utente non trovato")

        permissions = fetch_user_permissions(profile.id)

        return UserProfileOut(
            id=profile.id,
            username=profile.username,
            email=profile.email,
            nome=profile.nome,
            cognome=profile.cognome,
            istituto=profile.istituto,
            role_id=profile.role_id,
            role_name=profile.role_name,
            permissions=permissions,
            bio=profile.bio,
            profile_picture=profile.profile_picture,
            last_login=profile.last_login,
        )

    async def update_profile(
        self,
        profile_update: UserProfileUpdate | None,
        file: UploadFile | None,
    ) -> MessageResponse:
        payload = await get_payload()
        user_id = int(payload.sub)
        update_data: dict[str, object] = {}

        # Handle file upload if needed
        if file and file.filename and file.size:
            if file.content_type not in ALLOWED_PROFILE_PICTURE_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail="Tipo di file non valido. Sono accettati solo JPEG, PNG, WEBP e GIF",
                )

            if file.size > 5_000_000:  # 5MB
                raise HTTPException(status_code=400, detail="Il file non può superare i 5MB")

            # Upload new file picture
            await upload_profile_picture(user_id, file)

            with PSQLDatabase() as db:
                cursor = db.get_cursor()
                cursor.execute(
                    "SELECT profile_picture FROM utenti WHERE id = %s",
                    (user_id,),
                )
                row = cursor.fetchone()
            update_data["profile_picture"] = row[0] if row else None

        if profile_update:
            updates = profile_update.model_dump(mode="python", exclude_unset=True)
            if updates.get("istituto") is not None:
                updates["istituto"] = updates["istituto"].value
            update_data.update(updates)

        if not update_data:
            raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")

        try:
            await update_user_profile(user_id, update_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e)) from e

        return MessageResponse(message="Profilo aggiornato con successo")

    async def get_users(self, offset: int | None, limit: int | None) -> UsersListResponse:
        payload = await get_payload()
        require_permission(payload, "view_users")
        offset = offset or 0
        limit = limit or 10

        with PSQLDatabase() as db:
            cursor = db.get_cursor()

            cursor.execute("SELECT COUNT(*) FROM utenti")
            total_users = cursor.fetchone()[0]

            cursor.execute(
                """
                SELECT u.id, u.nome, u.cognome, u.username, u.role_id, r.name AS role_name,
                       u.istituto, u.email
                FROM utenti u
                JOIN roles r ON u.role_id = r.id
                ORDER BY u.id
                LIMIT %s OFFSET %s
                """,
                (limit, offset),
            )
            users_raw = db.fetchall_as(UserListRow)

        if not users_raw:
            return MessageResponse(message="Nessun utente trovato")

        users = [_user_list_item(user) for user in users_raw]
        return UsersListResponse(users=users, total=total_users)

    async def get_recent_users(self, limit: int | None) -> UsersRecentListResponse:
        payload = await get_payload()
        require_permission(payload, "view_users")
        limit = limit or 5

        with PSQLDatabase() as db:
            cursor = db.get_cursor()
            cursor.execute(
                """
                SELECT u.id, u.nome, u.cognome, u.username, u.role_id, r.name AS role_name,
                       u.istituto, u.email
                FROM utenti u
                JOIN roles r ON u.role_id = r.id
                ORDER BY u.id DESC
                LIMIT %s
                """,
                (limit,),
            )
            users_raw = db.fetchall_as(UserListRow)

        if not users_raw:
            return MessageResponse(message="Nessun utente trovato")

        users = [_user_list_item(user) for user in users_raw]
        return UsersRecentListResponse(users=users)

    async def update_user(
        self,
        user_id: int,
        update_user_request: UpdateUserRequest,
    ) -> MessageResponse:
        payload = await get_payload()
        current_user_id = int(payload.sub)
        extra = payload.model_extra or {}
        current_role_id = int(extra.get("role_id", 0))

        # Fetch the target user and also get role positions for hierarchy
        with PSQLDatabase() as db:
            cursor = db.get_cursor()

            # Get current user's role position (lower = higher rank)
            cursor.execute(
                "SELECT position FROM roles WHERE id = %s",
                (current_role_id,),
            )
            cur_pos_row = cursor.fetchone()
            if not cur_pos_row:
                raise HTTPException(status_code=403, detail="Ruolo non trovato")
            current_position = cur_pos_row[0]

            # Get target user info
            cursor.execute(
                """
                SELECT u.id, u.role_id, r.position AS role_position, r.name AS role_name
                FROM utenti u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = %s
                """,
                (user_id,),
            )
            target = cursor.fetchone()

        if not target:
            raise HTTPException(status_code=404, detail="Utente non trovato")

        _target_id, _target_role_id, target_position, _target_role_name = target

        user_data = self._to_update_payload(update_user_request.user_data)

        # Can't modify yourself
        if user_id == current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Non puoi modificare il tuo stesso account da questa endpoint",
            )

        # Hierarchy check: can't modify users with same/higher rank
        # Lower position number = higher rank (admin=1, utente=3)
        if target_position <= current_position:
            raise HTTPException(
                status_code=403,
                detail="Non puoi modificare utenti con ruolo uguale o superiore al tuo",
            )

        # If changing role, validate new role is lower rank than current user
        if user_data.ruolo is not None:
            new_role_id = int(user_data.ruolo)
            with PSQLDatabase() as db:
                cursor = db.get_cursor()
                cursor.execute(
                    "SELECT position FROM roles WHERE id = %s",
                    (new_role_id,),
                )
                new_pos_row = cursor.fetchone()
                if not new_pos_row:
                    raise HTTPException(status_code=400, detail="Ruolo non valido")
                new_position = new_pos_row[0]

                if new_position <= current_position:
                    raise HTTPException(
                        status_code=403,
                        detail="Non puoi assegnare un ruolo uguale o superiore al tuo",
                    )

        allowed_fields = {"nome", "cognome", "username", "ruolo", "email"}
        update_fields = []
        values = []
        for key, value in user_data.model_dump(exclude_unset=True).items():
            if key in allowed_fields:
                # Map frontend 'ruolo' (role_id int) to DB column 'role_id'
                db_key = "role_id" if key == "ruolo" else key
                update_fields.append(f"{db_key} = %s")
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

        return MessageResponse(message="Utente aggiornato con successo")

    @staticmethod
    def _to_update_payload(data: UpdateUserData) -> UpdateUserPayload:
        fields = data.model_dump(exclude_unset=True)
        return UpdateUserPayload.model_validate(fields)
