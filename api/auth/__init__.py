import os
from datetime import timedelta

from dotenv import load_dotenv
from authx import AuthX, AuthXConfig

load_dotenv()

JWT_ACCESS_TOKEN_EXPIRES = timedelta(
    minutes = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "15"))
)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(
    days = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "30"))
)


class Auth(AuthX):
    def __init__(self, config: AuthXConfig):
        super().__init__(config)

    @staticmethod
    def access_max_age() -> int:
        return int(JWT_ACCESS_TOKEN_EXPIRES.total_seconds())

    @staticmethod
    def refresh_max_age() -> int:
        return int(JWT_REFRESH_TOKEN_EXPIRES.total_seconds())


auth = Auth(AuthXConfig(
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY"),
    JWT_ALGORITHM = "HS256",
    JWT_TOKEN_LOCATION = ["cookies"],
    JWT_ACCESS_COOKIE_NAME = "access_token",
    JWT_REFRESH_COOKIE_NAME = "refresh_token",
    # Set to True in production (requires HTTPS)
    JWT_COOKIE_SECURE = os.getenv("JWT_COOKIE_SECURE", "false").lower() == "true",
    JWT_COOKIE_HTTP_ONLY = True,
    # Enable in production if you need CSRF double-submit protection
    JWT_COOKIE_CSRF_PROTECT = os.getenv("JWT_COOKIE_CSRF_PROTECT", "false").lower()
                              == "true",
    JWT_CSRF_IN_COOKIES = os.getenv("JWT_COOKIE_CSRF_PROTECT", "false").lower() == "true",
    JWT_ACCESS_TOKEN_EXPIRES = JWT_ACCESS_TOKEN_EXPIRES,
    JWT_REFRESH_TOKEN_EXPIRES = JWT_REFRESH_TOKEN_EXPIRES,
))
