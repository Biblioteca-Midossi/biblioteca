# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.books_api_base import BaseBooksApi
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
from openapi_server.models.book_detail_response import BookDetailResponse
from openapi_server.models.books_list_response import BooksListResponse
from openapi_server.models.http_validation_error import HTTPValidationError
from openapi_server.models.message_response import MessageResponse
from openapi_server.models.recent_books_list_response import RecentBooksListResponse
from fastapi import File, UploadFile
from openapi_server.models.extra_models import TokenModel  # noqa: F401
from openapi_server.security_api import get_token_AuthXAccessCookie

router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/books/",
    responses={
        200: {"model": BooksListResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["books"],
    summary="Get Books",
    response_model_by_alias=True,
)
async def get_books_books_get(
    page: Optional[int] = Query(1, description="", alias="page"),
    limit: Optional[int] = Query(12, description="", alias="limit"),
    search: Optional[str] = Query(None, description="", alias="search"),
) -> BooksListResponse:
    if not BaseBooksApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseBooksApi.subclasses[0]().get_books_books_get(page, limit, search)


@router.post(
    "/books/",
    responses={
        200: {"model": object, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["books"],
    summary="Create Book",
    response_model_by_alias=True,
)
async def create_book_books_post(
    thumbnail: Optional[UploadFile] = File(None, description="", alias="thumbnail"),
    token_AuthXAccessCookie: TokenModel = Security(
        get_token_AuthXAccessCookie
    ),
) -> object:
    if not BaseBooksApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseBooksApi.subclasses[0]().create_book_books_post(thumbnail)


@router.get(
    "/books/recent",
    responses={
        200: {"model": RecentBooksListResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["books"],
    summary="Get Recent Books",
    response_model_by_alias=True,
)
async def get_recent_books_books_recent_get(
    limit: Optional[Annotated[int, Field(le=50, ge=1)]] = Query(5, description="", alias="limit", ge=1, le=50),
) -> RecentBooksListResponse:
    """Return the most recently added books by picking the highest id_libro values. The result is ordered by id_libro desc and limited by &#x60;limit&#x60;."""
    if not BaseBooksApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseBooksApi.subclasses[0]().get_recent_books_books_recent_get(limit)


@router.get(
    "/books/{book_id}",
    responses={
        200: {"model": BookDetailResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["books"],
    summary="Get Book",
    response_model_by_alias=True,
)
async def get_book_books_book_id_get(
    book_id: int = Path(..., description=""),
) -> BookDetailResponse:
    if not BaseBooksApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseBooksApi.subclasses[0]().get_book_books_book_id_get(book_id)


@router.put(
    "/books/{book_id}",
    responses={
        200: {"model": MessageResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["books"],
    summary="Update Book",
    response_model_by_alias=True,
)
async def update_book_books_book_id_put(
    book_id: int = Path(..., description=""),
    file: Optional[UploadFile] = File(None, description="", alias="file"),
    token_AuthXAccessCookie: TokenModel = Security(
        get_token_AuthXAccessCookie
    ),
) -> MessageResponse:
    if not BaseBooksApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseBooksApi.subclasses[0]().update_book_books_book_id_put(book_id, file)


@router.delete(
    "/books/{book_id}",
    responses={
        200: {"model": MessageResponse, "description": "Successful Response"},
        404: {"description": "Not found"},
        422: {"model": HTTPValidationError, "description": "Validation Error"},
    },
    tags=["books"],
    summary="Delete Book",
    response_model_by_alias=True,
)
async def delete_book_books_book_id_delete(
    book_id: int = Path(..., description=""),
    token_AuthXAccessCookie: TokenModel = Security(
        get_token_AuthXAccessCookie
    ),
) -> MessageResponse:
    if not BaseBooksApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseBooksApi.subclasses[0]().delete_book_books_book_id_delete(book_id)
