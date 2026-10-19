from pydantic import BaseModel, EmailStr

from api.models.enums import Istituto


class RegisterRequest(BaseModel):
    nome: str
    cognome: str
    username: str
    email: EmailStr
    password: str
    istituto: Istituto


class LoginRequest(BaseModel):
    # accepts either a username or an email
    login: str
    password: str


class UserProfileUpdate(BaseModel):
    nome: str | None
    cognome: str | None
    email: EmailStr | None
    bio: str | None
    istituto: Istituto | None


# ─── Role & Permission Models ────────────────────────────────────────────────


class RoleOut(BaseModel):
    id: int
    name: str
    display_name: str
    position: int
    color: str
    permissions: list[str] = []


class PermissionOut(BaseModel):
    id: int
    name: str
    display_name: str
    group_name: str
