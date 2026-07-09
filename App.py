from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from api.routes import register_routes
from api.auth import auth


biblioteca = FastAPI()

api = FastAPI(
    swagger_ui_parameters={
        "syntaxHighlight.theme": "obsidian",
    },
    redoc_url=None,
)

auth.handle_errors(api)
register_routes(api)

api.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

biblioteca.mount("/api", api)

biblioteca.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")


@biblioteca.get("/health")
async def root():
    return {"status": "ok"}


@biblioteca.get("/{full_path:path}")
def spa_fallback(full_path: str):
    return FileResponse("dist/index.html")
