from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from api.routes import register_routes
from api.auth import auth


biblioteca = FastAPI(
    root_path="/api",
    swagger_ui_parameters={
        "syntaxHighlight.theme": "obsidian",
    },
    redoc_url=None,
)

# register error handlers and routes at module level, not lifespan
auth.handle_errors(biblioteca)

biblioteca.mount("/assets", StaticFiles(directory="dist/assets", name="assets"))
biblioteca.mount("/uploads", StaticFiles(directory="uploads", name="uploads"))


@biblioteca.get("/{full_path:path")
def spa_fallback(full_path: str):
    return FileResponse("dist/index.html")


register_routes(biblioteca)


@biblioteca.get("/health")
async def root():
    return {"status": "ok"}
