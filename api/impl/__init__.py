"""Impl modules for the generated OpenAPI interfaces.

Importing this package installs the security shim
(``api.impl._security_setup``) BEFORE the generated routers are imported —
generated routers import ``api.impl`` at module load time — and registers
every impl subclass.
"""

from api.impl._middleware import install_request_context_middleware
from api.impl._security_setup import install_security_shim

install_security_shim()

__all__ = ["install_request_context_middleware", "install_security_shim"]
