# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictBytes, StrictStr
from typing import Any, Optional, Tuple, Union
from typing_extensions import Annotated
from openapi_server.models.http_validation_error import HTTPValidationError
from openapi_server.models.message_response import MessageResponse
from openapi_server.models.user_profile_out import UserProfileOut
from openapi_server.models.users_list_response import UsersListResponse
from openapi_server.models.users_recent_list_response import UsersRecentListResponse
from fastapi import File, UploadFile
from openapi_server.security_api import get_token_AuthXAccessCookie

class BaseUsersApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseUsersApi.subclasses = BaseUsersApi.subclasses + (cls,)
    async def get_profile_users_me_get(
        self,
    ) -> UserProfileOut:
        ...


    async def update_profile_users_me_put(
        self,
        profile_update: Optional[Any],
        file: Optional[UploadFile],
    ) -> MessageResponse:
        ...


    async def get_users_users_get_users_get(
        self,
        offset: Optional[Annotated[int, Field(ge=0)]],
        limit: Optional[Annotated[int, Field(le=100, ge=1)]],
    ) -> UsersListResponse:
        ...


    async def get_recent_users_users_recent_get(
        self,
        limit: Optional[Annotated[int, Field(le=100, ge=1)]],
    ) -> UsersRecentListResponse:
        ...


    async def update_user_users_update_user_user_id_put(
        self,
        user_id: int,
    ) -> MessageResponse:
        ...
