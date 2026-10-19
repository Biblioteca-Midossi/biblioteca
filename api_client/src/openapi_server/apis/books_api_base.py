# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictBytes, StrictStr
from typing import Any, Optional, Tuple, Union
from typing_extensions import Annotated
from openapi_server.models.book_detail_response import BookDetailResponse
from openapi_server.models.books_list_response import BooksListResponse
from openapi_server.models.http_validation_error import HTTPValidationError
from openapi_server.models.message_response import MessageResponse
from openapi_server.models.recent_books_list_response import RecentBooksListResponse
from fastapi import File, UploadFile
from openapi_server.security_api import get_token_AuthXAccessCookie

class BaseBooksApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseBooksApi.subclasses = BaseBooksApi.subclasses + (cls,)
    async def get_books_books_get(
        self,
        page: Optional[int],
        limit: Optional[int],
        search: Optional[str],
    ) -> BooksListResponse:
        ...


    async def create_book_books_post(
        self,
        thumbnail: Optional[UploadFile],
    ) -> object:
        ...


    async def get_recent_books_books_recent_get(
        self,
        limit: Optional[Annotated[int, Field(le=50, ge=1)]],
    ) -> RecentBooksListResponse:
        """Return the most recently added books by picking the highest id_libro values. The result is ordered by id_libro desc and limited by &#x60;limit&#x60;."""
        ...


    async def get_book_books_book_id_get(
        self,
        book_id: int,
    ) -> BookDetailResponse:
        ...


    async def update_book_books_book_id_put(
        self,
        book_id: int,
        file: Optional[UploadFile],
    ) -> MessageResponse:
        ...


    async def delete_book_books_book_id_delete(
        self,
        book_id: int,
    ) -> MessageResponse:
        ...
