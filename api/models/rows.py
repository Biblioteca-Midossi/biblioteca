from datetime import datetime

from pydantic import BaseModel, ConfigDict

from api.models.enums import Istituto


class BookListRow(BaseModel):
    """Row shape for the GET /books list query."""
    model_config = ConfigDict(populate_by_name=True)

    id_libro: int
    titolo: str
    thumbnail_path: str | None = None
    isbn: str
    quantita: int
    casa_editrice: str | None = None
    descrizione: str | None = None
    istituto: Istituto | None = None
    scaffale: str | None = None
    generi: list[str] = []
    autori: list[str] = []
    total_count: int = 0
    maxpage: int = 1


class RecentBookRow(BaseModel):
    """Row shape for the GET /books/recent query."""
    model_config = ConfigDict(populate_by_name=True)

    id_libro: int
    titolo: str
    thumbnail_path: str | None = None
    isbn: str | None = None
    quantita: int | None = None
    casa_editrice: str | None = None
    autori: list[str] | None = None


class BookDetailRow(BaseModel):
    """Row shape for the GET /books/{id} query."""
    model_config = ConfigDict(populate_by_name=True)

    id_libro: int
    isbn: str
    titolo: str
    quantita: int
    casa_editrice: str | None = None
    thumbnail_path: str | None = None
    descrizione: str | None = None
    istituto: Istituto | None = None
    scaffale: str | None = None
    generi: list[str] = []
    autori: list[str] = []


class BookThumbnailRow(BaseModel):
    """Row shape for the DELETE /books/{id} thumbnail query."""
    model_config = ConfigDict(populate_by_name=True)

    thumbnail_path: str | None = None


class UserListRow(BaseModel):
    """Row shape for user listing queries."""
    model_config = ConfigDict(populate_by_name=True)

    id: int
    nome: str
    cognome: str
    username: str
    ruolo: int
    istituto: Istituto | None = None
    email: str


class UserLoginRow(BaseModel):
    """Row shape for the login query on utenti."""
    model_config = ConfigDict(populate_by_name=True)

    id: int
    password: str
    ruolo: int
    istituto: Istituto | None = None
    username: str


class UserProfileRow(BaseModel):
    """Full row shape from utenti (SELECT *)."""
    model_config = ConfigDict(populate_by_name=True)

    id: int
    cognome: str
    nome: str
    istituto: Istituto | None = None
    ruolo: int
    password: str
    username: str
    email: str
    profile_picture: str | None = None
    bio: str | None = None
    last_login: datetime | None = None
    preferred_language: str | None = None
    notification_settings: dict | None = None
    created_at: str | None = None


class UserBasicRow(BaseModel):
    """Minimal row shape for id/istituto/ruolo lookups."""
    model_config = ConfigDict(populate_by_name=True)

    id: int
    username: str
    istituto: Istituto | None = None
    ruolo: int
