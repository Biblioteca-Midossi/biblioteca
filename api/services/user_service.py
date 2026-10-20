from api.lib.database import PSQLDatabase
from api.models.requests import UserProfilePatch
from api.models.rows import UserBasicRow, UserProfileRow

# Fixed field -> column map for profile updates; only these columns are ever written.
PROFILE_PATCH_COLUMNS: dict[str, str] = {
    "profile_picture": "profile_picture",
    "nome": "nome",
    "cognome": "cognome",
    "email": "email",
    "bio": "bio",
    "istituto": "istituto",
}


async def get_user_profile(user_id: int) -> UserProfileRow | None:
    async with PSQLDatabase() as db:
        return await db.fetchone_as(
            UserProfileRow,
            """
            SELECT u.*, r.name AS role_name
            FROM utenti u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = %s
            """,
            (user_id,),
        )


async def get_user_by_id(user_id: int) -> UserBasicRow | None:
    async with PSQLDatabase() as db:
        return await db.fetchone_as(
            UserBasicRow,
            """
            SELECT u.id, u.username, u.istituto, u.role_id, r.name AS role_name
            FROM utenti u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = %s
            """,
            (user_id,),
        )


async def update_user_profile(user_id: int, patch: UserProfilePatch) -> None:
    fields = patch.model_dump(exclude_unset=True)
    # Keep only known columns, in the fixed map's order — never build SQL from raw keys.
    assignments = [
        (col, fields[name]) for name, col in PROFILE_PATCH_COLUMNS.items() if name in fields
    ]
    if not assignments:
        return

    set_clause = ", ".join(f"{col} = %s" for col, _ in assignments)
    values = [value for _, value in assignments]

    async with PSQLDatabase() as db:
        await db.execute(f"UPDATE utenti SET {set_clause} WHERE id = %s", (*values, user_id))
        await db.commit()
