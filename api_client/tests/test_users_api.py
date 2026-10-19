# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictBytes, StrictStr  # noqa: F401
from typing import Any, Optional, Tuple, Union  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from openapi_server.models.http_validation_error import HTTPValidationError  # noqa: F401
from openapi_server.models.message_response import MessageResponse  # noqa: F401
from openapi_server.models.user_profile_out import UserProfileOut  # noqa: F401
from openapi_server.models.users_list_response import UsersListResponse  # noqa: F401
from openapi_server.models.users_recent_list_response import UsersRecentListResponse  # noqa: F401
from fastapi import File, UploadFile  # noqa: F401


def test_get_profile_users_me_get(client: TestClient):
    """Test case for get_profile_users_me_get

    Get Profile
    """

    headers = {
        "AuthXAccessCookie": "special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/users/me",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_update_profile_users_me_put(client: TestClient):
    """Test case for update_profile_users_me_put

    Update Profile
    """

    headers = {
        "AuthXAccessCookie": "special-key",
    }
    data = {
        "profile_update": openapi_server.UserProfileUpdate(),
        "file": None
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/users/me",
    #    headers=headers,
    #    data=data,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_users_users_get_users_get(client: TestClient):
    """Test case for get_users_users_get_users_get

    Get Users
    """
    params = [("offset", 0),     ("limit", 10)]
    headers = {
        "AuthXAccessCookie": "special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/users/get-users",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_recent_users_users_recent_get(client: TestClient):
    """Test case for get_recent_users_users_recent_get

    Get Recent Users
    """
    params = [("limit", 5)]
    headers = {
        "AuthXAccessCookie": "special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/users/recent",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_update_user_users_update_user_user_id_put(client: TestClient):
    """Test case for update_user_users_update_user_user_id_put

    Update User
    """

    headers = {
        "AuthXAccessCookie": "special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/users/update-user/{user_id}".format(user_id=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

