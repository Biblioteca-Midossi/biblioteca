from importlib import import_module
from pkgutil import iter_modules

from fastapi import FastAPI, APIRouter


def register_routes(app: FastAPI):
    for module_info in iter_modules(__path__):
        module = import_module(f"{__name__}.{module_info.name}")

        router = getattr(module, "router", None)

        if isinstance(router, APIRouter):
            app.include_router(router)
