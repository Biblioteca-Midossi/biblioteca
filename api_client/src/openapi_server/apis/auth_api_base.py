# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from typing import Any
from openapi_server.models.http_validation_error import HTTPValidationError
from openapi_server.models.login_request import LoginRequest
from openapi_server.models.message_response import MessageResponse
from openapi_server.models.register_request import RegisterRequest


class BaseAuthApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseAuthApi.subclasses = BaseAuthApi.subclasses + (cls,)
    async def register_auth_register_post(
        self,
        register_request: RegisterRequest,
    ) -> MessageResponse:
        ...


    async def login_auth_login_post(
        self,
        login_request: LoginRequest,
    ) -> MessageResponse:
        ...


    async def refresh_auth_refresh_post(
        self,
    ) -> MessageResponse:
        ...


    async def logout_auth_logout_post(
        self,
    ) -> MessageResponse:
        ...
