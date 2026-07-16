from fastapi import APIRouter, Depends

from api.auth.helpers import require_permission
from api.lib.database import PSQLDatabase
from api.models.auth import RoleOut

router = APIRouter(
    prefix="/roles", tags=["roles"], responses={404: {"description": "Not found"}}
)


@router.get("/", response_model=list[RoleOut])
async def list_roles(
    _=Depends(require_permission("view_users")),
) -> list[RoleOut]:
    """List all roles with their permissions. Requires view_users permission."""
    with PSQLDatabase() as db:
        cursor = db.get_cursor()
        cursor.execute(
            "SELECT id, name, display_name, position, color FROM roles ORDER BY position ASC"
        )
        roles_raw = cursor.fetchall()

        roles = []
        for r in roles_raw:
            role_id, name, display_name, position, color = r
            cursor.execute(
                """
                SELECT p.name
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = %s
                ORDER BY p.group_name, p.name
                """,
                (role_id,),
            )
            permissions = [row[0] for row in cursor.fetchall()]

            roles.append(
                RoleOut(
                    id=role_id,
                    name=name,
                    display_name=display_name,
                    position=position,
                    color=color,
                    permissions=permissions,
                )
            )

    return roles
