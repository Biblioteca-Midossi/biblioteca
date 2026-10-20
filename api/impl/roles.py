"""Roles endpoints implemented on top of the generated BaseRolesApi."""

from biblioteca_api.apis.roles_api_base import BaseRolesApi
from biblioteca_api.models.role_out import RoleOut

from api.impl._security import get_payload, require_permission
from api.lib.database import PSQLDatabase
from api.models.rows import PermissionNameRow


class RolesImpl(BaseRolesApi):
    async def list_roles(self) -> list[RoleOut]:
        """List all roles with their permissions. Requires view_users permission."""
        payload = await get_payload()
        await require_permission(payload, "view_users")
        async with PSQLDatabase() as db:
            cursor = db.get_cursor()
            await cursor.execute(
                "SELECT id, name, display_name, position, color FROM roles ORDER BY position ASC"
            )
            roles_raw = await cursor.fetchall()

            roles = []
            for role_id, name, display_name, position, color in roles_raw:
                permission_rows = await db.fetchall_as(
                    PermissionNameRow,
                    """
                    SELECT p.name
                    FROM permissions p
                    JOIN role_permissions rp ON p.id = rp.permission_id
                    WHERE rp.role_id = %s
                    ORDER BY p.group_name, p.name
                    """,
                    (role_id,),
                )
                permissions = [row.name for row in permission_rows]

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
