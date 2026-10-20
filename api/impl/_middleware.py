"""Request-context middleware so the security shim can access the request."""

from collections.abc import Callable

from starlette.types import ASGIApp, Receive, Scope, Send

from api.impl._security import set_active_request


class RequestContextMiddleware:
    """Expose the current request to the impl-layer security shim."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            from fastapi import Request

            request = Request(scope, receive=receive)
            set_active_request(request)
        try:
            await self.app(scope, receive, send)
        finally:
            set_active_request(None)


def install_request_context_middleware(
    add_middleware: Callable[..., None],
) -> None:
    add_middleware(RequestContextMiddleware)
