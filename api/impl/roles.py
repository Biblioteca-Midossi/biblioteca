"""Roles endpoints implemented on top of the generated BaseRolesApi."""

from biblioteca_api.apis.roles_api_base import BaseRolesApi
from biblioteca_api.models.role_out import RoleOut

from api.impl._security import get_payload, require_permission
from api.lib.database import PSQLDatabase


class RolesImpl(BaseRolesApi):
    async def list_roles(self) -> list[RoleOut]:
        """List all roles with their permissions. Requires view_users permission."""
        payload = await get_payload()
        require_permission(payload, "view_users")
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
