# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictBytes, StrictStr  # noqa: F401
from typing import Any, Optional, Tuple, Union  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from openapi_server.models.book_detail_response import BookDetailResponse  # noqa: F401
from openapi_server.models.books_list_response import BooksListResponse  # noqa: F401
from openapi_server.models.http_validation_error import HTTPValidationError  # noqa: F401
from openapi_server.models.message_response import MessageResponse  # noqa: F401
from openapi_server.models.recent_books_list_response import RecentBooksListResponse  # noqa: F401
from fastapi import File, UploadFile  # noqa: F401


def test_get_books_books_get(client: TestClient):
    """Test case for get_books_books_get

    Get Books
    """
    params = [("page", 1),     ("limit", 12),     ("search", 'search_example')]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/books/",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_create_book_books_post(client: TestClient):
    """Test case for create_book_books_post

    Create Book
    """

    headers = {
        "AuthXAccessCookie": "special-key",
    }
    data = {
        "thumbnail": None
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/books/",
    #    headers=headers,
    #    data=data,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_recent_books_books_recent_get(client: TestClient):
    """Test case for get_recent_books_books_recent_get

    Get Recent Books
    """
    params = [("limit", 5)]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/books/recent",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_book_books_book_id_get(client: TestClient):
    """Test case for get_book_books_book_id_get

    Get Book
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/books/{book_id}".format(book_id=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_update_book_books_book_id_put(client: TestClient):
    """Test case for update_book_books_book_id_put

    Update Book
    """

    headers = {
        "AuthXAccessCookie": "special-key",
    }
    data = {
        "file": None
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/books/{book_id}".format(book_id=56),
    #    headers=headers,
    #    data=data,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_delete_book_books_book_id_delete(client: TestClient):
    """Test case for delete_book_books_book_id_delete

    Delete Book
    """

    headers = {
        "AuthXAccessCookie": "special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "DELETE",
    #    "/books/{book_id}".format(book_id=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

