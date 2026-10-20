import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# Generated server package (contracts_gen/biblioteca_api) is not installed;
# make it importable when running from the repo root.
sys.path.insert(0, str(Path(__file__).resolve().parent / "contracts_gen"))

from biblioteca_api.apis.auth_api import router as auth_router
from biblioteca_api.apis.books_api import router as books_router
from biblioteca_api.apis.roles_api import router as roles_router
from biblioteca_api.apis.users_api import router as users_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from api.auth import auth
from api.impl import install_request_context_middleware
from api.lib.database import ensure_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_admin()
    yield


biblioteca = FastAPI(lifespan=lifespan)

# CORS for Vite dev server
biblioteca.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = FastAPI(
    swagger_ui_parameters={
        "syntaxHighlight.theme": "obsidian",
    },
    redoc_url=None,
)

auth.handle_errors(api)

install_request_context_middleware(api.add_middleware)
api.include_router(auth_router)
api.include_router(books_router)
api.include_router(users_router)
api.include_router(roles_router)

for upload_dir in ("uploads/thumbnails", "uploads/profile_pictures"):
    os.makedirs(upload_dir, exist_ok=True)

api.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

biblioteca.mount("/api", api)

biblioteca.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")


@biblioteca.get("/health")
async def root():
    return {"status": "ok"}


@biblioteca.get("/{full_path:path}")
def spa_fallback(full_path: str):
    return FileResponse("dist/index.html")
