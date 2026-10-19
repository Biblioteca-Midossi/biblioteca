# coding: utf-8

from fastapi.testclient import TestClient


from typing import Any, List  # noqa: F401
from openapi_server.models.role_out import RoleOut  # noqa: F401


def test_list_roles_roles_get(client: TestClient):
    """Test case for list_roles_roles_get

    List Roles
    """

    headers = {
        "AuthXAccessCookie": "special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/roles/",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

