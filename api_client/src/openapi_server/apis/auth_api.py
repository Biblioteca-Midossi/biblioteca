# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.auth_api_base import BaseAuthApi
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

from typing import Any
from openapi_server.models.http_validation_error import HTTPValidationError
from openapi_server.models.login_request import LoginRequest
from openapi_server.models.message_response import MessageResponse
from openapi_server.models.register_request import RegisterRequest

router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/auth/register",
    responses={
        201: {"model": MessageResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["auth"],
    summary="Register",
    response_model_by_alias=True,
)
async def register_auth_register_post(
    register_request: RegisterRequest = Body(..., description=""),
) -> MessageResponse:
    if not BaseAuthApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAuthApi.subclasses[0]().register_auth_register_post(register_request)


@router.post(
    "/auth/login",
    responses={
        200: {"model": MessageResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["auth"],
    summary="Login",
    response_model_by_alias=True,
)
async def login_auth_login_post(
    login_request: LoginRequest = Body(..., description=""),
) -> MessageResponse:
    if not BaseAuthApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAuthApi.subclasses[0]().login_auth_login_post(login_request)


@router.post(
    "/auth/refresh",
    responses={
        200: {"model": MessageResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
    },
    tags=["auth"],
    summary="Refresh",
    response_model_by_alias=True,
)
async def refresh_auth_refresh_post(
) -> MessageResponse:
    if not BaseAuthApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAuthApi.subclasses[0]().refresh_auth_refresh_post()


@router.post(
    "/auth/logout",
    responses={
        200: {"model": MessageResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
    },
    tags=["auth"],
    summary="Logout",
    response_model_by_alias=True,
)
async def logout_auth_logout_post(
) -> MessageResponse:
    if not BaseAuthApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAuthApi.subclasses[0]().logout_auth_logout_post()
