# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.roles_api_base import BaseRolesApi
import openapi_server.impl

from fastapi import (  # noqa: F401
    APIRouter,
    Body,
    Cookie,
    Depends,
    Form,
    Header,
    HTTPException,
    Path,
    Query,
    Response,
    Security,
    status,
)

from typing import Any, List
from openapi_server.models.role_out import RoleOut
from openapi_server.models.extra_models import TokenModel  # noqa: F401
from openapi_server.security_api import get_token_AuthXAccessCookie

router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/roles/",
    responses={
        200: {"model": List[RoleOut], "description": "Successful Response"},
        404: {"description": "Not found"},
    },
    tags=["roles"],
    summary="List Roles",
    response_model_by_alias=True,
)
async def list_roles_roles_get(
    token_AuthXAccessCookie: TokenModel = Security(
        get_token_AuthXAccessCookie
    ),
) -> List[RoleOut]:
    """List all roles with their permissions. Requires view_users permission."""
    if not BaseRolesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseRolesApi.subclasses[0]().list_roles_roles_get()
