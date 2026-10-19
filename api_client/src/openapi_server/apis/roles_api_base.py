# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from typing import Any, List
from openapi_server.models.role_out import RoleOut
from openapi_server.security_api import get_token_AuthXAccessCookie

class BaseRolesApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseRolesApi.subclasses = BaseRolesApi.subclasses + (cls,)
    async def list_roles_roles_get(
        self,
    ) -> List[RoleOut]:
        """List all roles with their permissions. Requires view_users permission."""
        ...
