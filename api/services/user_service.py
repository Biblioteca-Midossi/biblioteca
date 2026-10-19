from api.lib.database import PSQLDatabase
from api.models.rows import UserBasicRow, UserProfileRow


async def get_user_profile(user_id: int) -> UserProfileRow | None:
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            """
            SELECT u.*, r.name AS role_name
            FROM utenti u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = %s
            """,
            (user_id,),
        )
        return db.fetchone_as(UserProfileRow)


async def get_user_by_id(user_id: int) -> UserBasicRow | None:
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            """
            SELECT u.id, u.username, u.istituto, u.role_id, r.name AS role_name
            FROM utenti u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = %s
            """,
            (user_id,),
        )
        return db.fetchone_as(UserBasicRow)


async def update_user_profile(user_id: int, profile_data: dict[str, object]) -> None:
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        update_fields = ", ".join([f"{k} = %s" for k in profile_data.keys()])
        query = f"UPDATE utenti SET {update_fields} WHERE id = %s"

        values = [*list(profile_data.values()), user_id]
        cursor.execute(query, values)
        db.commit()
