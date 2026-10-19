# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.users_api_base import BaseUsersApi
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

from pydantic import Field, StrictBytes, StrictStr
from typing import Any, Optional, Tuple, Union
from typing_extensions import Annotated
from openapi_server.models.http_validation_error import HTTPValidationError
from openapi_server.models.message_response import MessageResponse
from openapi_server.models.user_profile_out import UserProfileOut
from openapi_server.models.users_list_response import UsersListResponse
from openapi_server.models.users_recent_list_response import UsersRecentListResponse
from fastapi import File, UploadFile
from openapi_server.models.extra_models import TokenModel  # noqa: F401
from openapi_server.security_api import get_token_AuthXAccessCookie

router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/users/me",
    responses={
        200: {"model": UserProfileOut, "description": "Successful Response"},
        404: {"description": "Not found"},
    },
    tags=["users"],
    summary="Get Profile",
    response_model_by_alias=True,
)
async def get_profile_users_me_get(
    token_AuthXAccessCookie: TokenModel = Security(
        get_token_AuthXAccessCookie
    ),
) -> UserProfileOut:
    if not BaseUsersApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUsersApi.subclasses[0]().get_profile_users_me_get()


@router.put(
    "/users/me",
    responses={
        200: {"model": MessageResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["users"],
    summary="Update Profile",
    response_model_by_alias=True,
)
async def update_profile_users_me_put(
    profile_update: Optional[Any] = Form(None, description="", alias="profile_update"),
    file: Optional[UploadFile] = File(None, description="", alias="file"),
    token_AuthXAccessCookie: TokenModel = Security(
        get_token_AuthXAccessCookie
    ),
) -> MessageResponse:
    if not BaseUsersApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUsersApi.subclasses[0]().update_profile_users_me_put(profile_update, file)


@router.get(
    "/users/get-users",
    responses={
        200: {"model": UsersListResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["users"],
    summary="Get Users",
    response_model_by_alias=True,
)
async def get_users_users_get_users_get(
    offset: Optional[Annotated[int, Field(ge=0)]] = Query(0, description="", alias="offset", ge=0),
    limit: Optional[Annotated[int, Field(le=100, ge=1)]] = Query(10, description="", alias="limit", ge=1, le=100),
    token_AuthXAccessCookie: TokenModel = Security(
        get_token_AuthXAccessCookie
    ),
) -> UsersListResponse:
    if not BaseUsersApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUsersApi.subclasses[0]().get_users_users_get_users_get(offset, limit)


@router.get(
    "/users/recent",
    responses={
        200: {"model": UsersRecentListResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["users"],
    summary="Get Recent Users",
    response_model_by_alias=True,
)
async def get_recent_users_users_recent_get(
    limit: Optional[Annotated[int, Field(le=100, ge=1)]] = Query(5, description="", alias="limit", ge=1, le=100),
    token_AuthXAccessCookie: TokenModel = Security(
        get_token_AuthXAccessCookie
    ),
) -> UsersRecentListResponse:
    if not BaseUsersApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUsersApi.subclasses[0]().get_recent_users_users_recent_get(limit)


@router.put(
    "/users/update-user/{user_id}",
    responses={
        200: {"model": MessageResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["users"],
    summary="Update User",
    response_model_by_alias=True,
)
async def update_user_users_update_user_user_id_put(
    user_id: int = Path(..., description=""),
    token_AuthXAccessCookie: TokenModel = Security(
        get_token_AuthXAccessCookie
    ),
) -> MessageResponse:
    if not BaseUsersApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUsersApi.subclasses[0]().update_user_users_update_user_user_id_put(user_id)
