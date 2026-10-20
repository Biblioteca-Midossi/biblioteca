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
    role_id: int
    role_name: str = ""
    istituto: Istituto | None = None
    email: str


class UserLoginRow(BaseModel):
    """Row shape for the login query on utenti."""

    model_config = ConfigDict(populate_by_name=True)

    id: int
    password: str
    role_id: int
    role_name: str = ""
    istituto: Istituto | None = None
    username: str


class UserProfileRow(BaseModel):
    """Full row shape from utenti (SELECT *)."""

    model_config = ConfigDict(populate_by_name=True)

    id: int
    cognome: str
    nome: str
    istituto: Istituto | None = None
    role_id: int
    role_name: str = ""
    password: str
    username: str
    email: str
    profile_picture: str | None = None
    bio: str | None = None
    last_login: datetime | None = None
    preferred_language: str | None = None
    notification_settings: dict | None = None
    created_at: datetime | None = None


class UserBasicRow(BaseModel):
    """Minimal row shape for id/istituto/role_id lookups."""

    model_config = ConfigDict(populate_by_name=True)

    id: int
    username: str
    istituto: Istituto | None = None
    role_id: int
    role_name: str = ""


class RolePositionRow(BaseModel):
    """Row shape for a role position lookup."""

    model_config = ConfigDict(populate_by_name=True)

    position: int


class UserTargetRow(BaseModel):
    """Row shape for the target-user lookup in update_user."""

    model_config = ConfigDict(populate_by_name=True)

    id: int
    role_id: int
    role_position: int
    role_name: str = ""


class UserSessionRow(BaseModel):
    """Row shape for a session lookup by token hash."""

    model_config = ConfigDict(populate_by_name=True)

    user_id: int
    revoked: bool
    expires_at: datetime


class UserRefreshInfoRow(BaseModel):
    """Row shape for refresh token info lookup on utenti."""

    model_config = ConfigDict(populate_by_name=True)

    role_id: int
    role_name: str = ""
    istituto: Istituto | None = None


class UserProfilePictureRow(BaseModel):
    """Row shape for a profile picture path lookup."""

    model_config = ConfigDict(populate_by_name=True)

    profile_picture: str | None = None


class UserIdRow(BaseModel):
    """Row shape for RETURNING id updates."""

    model_config = ConfigDict(populate_by_name=True)

    id: int


class BookExistsRow(BaseModel):
    """Row shape for a book existence check."""

    model_config = ConfigDict(populate_by_name=True)

    one: int


class CollocazioneRow(BaseModel):
    """Row shape for the istituto/scaffale lookup in update_book."""

    model_config = ConfigDict(populate_by_name=True)

    istituto: str | None = None
    scaffale: str | None = None


class RoleNameRow(BaseModel):
    """Single-column row shape for role name lookups."""

    model_config = ConfigDict(populate_by_name=True)

    name: str


class PermissionNameRow(BaseModel):
    """Single-column row shape for permission name lookups."""

    model_config = ConfigDict(populate_by_name=True)

    name: str
