# coding: utf-8

from fastapi.testclient import TestClient


from typing import Any  # noqa: F401
from openapi_server.models.http_validation_error import HTTPValidationError  # noqa: F401
from openapi_server.models.login_request import LoginRequest  # noqa: F401
from openapi_server.models.message_response import MessageResponse  # noqa: F401
from openapi_server.models.register_request import RegisterRequest  # noqa: F401


def test_register_auth_register_post(client: TestClient):
    """Test case for register_auth_register_post

    Register
    """
    register_request = openapi_server.RegisterRequest()

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/auth/register",
    #    headers=headers,
    #    json=register_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_login_auth_login_post(client: TestClient):
    """Test case for login_auth_login_post

    Login
    """
    login_request = openapi_server.LoginRequest()

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/auth/login",
    #    headers=headers,
    #    json=login_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_refresh_auth_refresh_post(client: TestClient):
    """Test case for refresh_auth_refresh_post

    Refresh
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/auth/refresh",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_logout_auth_logout_post(client: TestClient):
    """Test case for logout_auth_logout_post

    Logout
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/auth/logout",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

