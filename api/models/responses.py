from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from api.models.enums import Istituto


class MessageResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    message: str


class BookResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: int
    titolo: str
    autori: list[str]
    cover_url: str | None = None
    isbn: str | None = None
    genere: list[str] = []
    quantita: int
    casa_editrice: str | None = None
    descrizione: str | None = None
    istituto: Istituto | None = None
    scaffale: str | None = None


class BooksListResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    books: list[BookResponse]
    maxpage: int


class RecentBookResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: int
    titolo: str
    autori: list[str] | None = None
    cover_url: str | None = None
    isbn: str | None = None
    quantita: int | None = None
    casa_editrice: str | None = None


class RecentBooksListResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    books: list[RecentBookResponse]


class BookDetailResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    book: BookResponse


class UserProfileOut(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: int
    username: str
    email: str
    nome: str
    cognome: str
    istituto: Istituto | None = None
    ruolo: int
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    last_login: Optional[datetime] = None


class UserListItem(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: int
    nome: str
    cognome: str
    username: str
    ruolo: int
    istituto: Istituto | None = None
    email: str


class UsersListResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    users: list[UserListItem]
    total: int


class UsersRecentListResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    users: list[UserListItem]
