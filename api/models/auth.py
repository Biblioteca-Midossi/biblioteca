from typing import Optional
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
    nome: Optional[str]
    cognome: Optional[str]
    email: Optional[EmailStr]
    bio: Optional[str]
    istituto: Optional[Istituto]
