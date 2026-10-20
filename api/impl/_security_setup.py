"""Installs the AuthX-backed security shim into the generated security_api."""

import biblioteca_api.security_api as security_api

from api.impl._security import get_payload


def install_security_shim() -> None:
    """Make generated routers resolve the real AuthX TokenPayload."""
    security_api.get_token_AuthXAccessCookie = get_payload
