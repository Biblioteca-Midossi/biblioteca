"""Shared helpers for impl classes: auth payload access and permission checks."""

from contextvars import ContextVar

from authx import TokenPayload
from fastapi import HTTPException, Request

from api.auth import auth

# The security shim is called by generated routers through ``Security(...)``,
# which gives us no request argument. AuthX resolves the token from the
# request, so we track the active request via a contextvar set by the
# middleware installed in ``api.impl.__init__``.
_request: ContextVar[Request | None] = ContextVar("api_impl_request", default=None)


def get_active_request() -> Request | None:
    return _request.get()


def set_active_request(request: Request | None) -> None:
    _request.set(request)


async def get_payload() -> TokenPayload:
    """Security shim for the generated routers.

    ``biblioteca_api.security_api.get_token_AuthXAccessCookie`` is rebound to
    this function at import time (see ``api/impl/_security_setup``), so
    generated routers call it via ``Security(...)`` and impl methods receive
    the real AuthX TokenPayload (AuthX resolves the token from cookies).
    """
    request = _request.get()
    if request is None:
        raise RuntimeError("No request context available for security shim")
    return await auth._auth_required(request=request, type="access")


async def require_permission(payload: TokenPayload, permission: str) -> None:
    """Check a named permission inside impl methods (router-level deps are gone)."""
    from api.auth.helpers import fetch_user_permissions

    perms = await fetch_user_permissions(int(payload.sub))
    if permission not in perms:
        raise HTTPException(status_code=403, detail="Permessi insufficienti")
