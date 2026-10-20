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
from api.lib.logger import log
from api.models.auth import UserProfileUpdate
from api.models.requests import UpdateUserPayload, UserProfilePatch
from api.models.rows import (
    RolePositionRow,
    UserIdRow,
    UserListRow,
    UserProfilePictureRow,
    UserReservationCountRow,
    UserTargetRow,
)
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

        permissions = await fetch_user_permissions(profile.id)

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
        patch = UserProfilePatch()

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

            async with PSQLDatabase() as db:
                row = await db.fetchone_as(
                    UserProfilePictureRow,
                    "SELECT profile_picture FROM utenti WHERE id = %s",
                    (user_id,),
                )
            patch.profile_picture = row.profile_picture if row else None

        if profile_update:
            updates = profile_update.model_dump(mode="python", exclude_unset=True)
            if "istituto" in updates and updates["istituto"] is not None:
                updates["istituto"] = updates["istituto"].value
            patch = patch.model_copy(update=updates)

        if not patch.model_fields_set:
            raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")

        try:
            await update_user_profile(user_id, patch)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e)) from e

        return MessageResponse(message="Profilo aggiornato con successo")

    async def get_users(self, offset: int | None, limit: int | None) -> UsersListResponse:
        payload = await get_payload()
        await require_permission(payload, "view_users")
        offset = offset or 0
        limit = limit or 10

        async with PSQLDatabase() as db:
            total_users = await db.fetch_scalar("SELECT COUNT(*) FROM utenti")
            users_raw = await db.fetchall_as(
                UserListRow,
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

        users = [_user_list_item(user) for user in users_raw]
        return UsersListResponse(users=users, total=total_users)

    async def get_recent_users(self, limit: int | None) -> UsersRecentListResponse:
        payload = await get_payload()
        await require_permission(payload, "view_users")
        limit = limit or 5

        async with PSQLDatabase() as db:
            users_raw = await db.fetchall_as(
                UserListRow,
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
        async with PSQLDatabase() as db:
            # Get current user's role position (lower = higher rank)
            current = await db.fetchone_as(
                RolePositionRow,
                "SELECT position FROM roles WHERE id = %s",
                (current_role_id,),
            )
            if not current:
                raise HTTPException(status_code=403, detail="Ruolo non trovato")
            current_position = current.position

            # Get target user info
            target = await db.fetchone_as(
                UserTargetRow,
                """
                SELECT u.id, u.role_id, r.position AS role_position, r.name AS role_name
                FROM utenti u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = %s
                """,
                (user_id,),
            )

        if not target:
            raise HTTPException(status_code=404, detail="Utente non trovato")

        target_position = target.role_position

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
            async with PSQLDatabase() as db:
                new_pos = await db.fetchone_as(
                    RolePositionRow,
                    "SELECT position FROM roles WHERE id = %s",
                    (new_role_id,),
                )
                if not new_pos:
                    raise HTTPException(status_code=400, detail="Ruolo non valido")

                if new_pos.position <= current_position:
                    raise HTTPException(
                        status_code=403,
                        detail="Non puoi assegnare un ruolo uguale o superiore al tuo",
                    )

        # Fixed field → column map (frontend 'ruolo' maps to DB 'role_id')
        field_columns = {
            "nome": "nome",
            "cognome": "cognome",
            "username": "username",
            "ruolo": "role_id",
            "email": "email",
        }
        updates = user_data.model_dump(exclude_unset=True)
        set_clause = ", ".join(f"{field_columns[key]} = %s" for key in updates)

        if not set_clause:
            raise HTTPException(status_code=400, detail="Nessun campo valido da aggiornare")

        async with PSQLDatabase() as db:
            updated = await db.fetchone_as(
                UserIdRow,
                f"UPDATE utenti SET {set_clause} WHERE id = %s RETURNING id",
                (*updates.values(), user_id),
            )
            if not updated:
                raise HTTPException(status_code=404, detail="Utente non trovato")
            await db.commit()

        return MessageResponse(message="Utente aggiornato con successo")

    async def delete_user(self, user_id: int) -> MessageResponse:
        payload = await get_payload()
        current_user_id = int(payload.sub)
        extra = payload.model_extra or {}
        current_role_id = int(extra.get("role_id", 0))

        async with PSQLDatabase() as db:
            position = await db.fetchone_as(
                RolePositionRow,
                "SELECT position FROM roles WHERE id = %s",
                (current_role_id,),
            )
            if not position:
                raise HTTPException(status_code=403, detail="Ruolo non trovato")
            current_position = position.position

            target = await db.fetchone_as(
                UserTargetRow,
                """
                SELECT u.id, u.role_id, r.position AS role_position, r.name AS role_name
                FROM utenti u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = %s
                """,
                (user_id,),
            )
            if not target:
                raise HTTPException(status_code=404, detail="Utente non trovato")

            if user_id == current_user_id:
                raise HTTPException(
                    status_code=403,
                    detail="Non puoi eliminare il tuo stesso account",
                )

            # Hierarchy check: lower position number = higher rank
            if target.role_position <= current_position:
                raise HTTPException(
                    status_code=403,
                    detail="Non puoi eliminare utenti con ruolo uguale o superiore al tuo",
                )

            reservations = await db.fetchone_as(
                UserReservationCountRow,
                "SELECT COUNT(*) AS count FROM prenotazioni WHERE id = %s",
                (user_id,),
            )
            if reservations and reservations.count > 0:
                raise HTTPException(
                    status_code=409,
                    detail="L'utente ha prenotazioni attive e non può essere eliminato",
                )

            deleted = await db.fetchone_as(
                UserIdRow,
                "DELETE FROM utenti WHERE id = %s RETURNING id",
                (user_id,),
            )
            if not deleted:
                raise HTTPException(status_code=404, detail="Utente non trovato")
            await db.commit()

        log.info(f"Utente {user_id} eliminato con successo")
        return MessageResponse(message="Utente eliminato con successo")

    @staticmethod
    def _to_update_payload(data: UpdateUserData) -> UpdateUserPayload:
        fields = data.model_dump(exclude_unset=True)
        return UpdateUserPayload.model_validate(fields)
