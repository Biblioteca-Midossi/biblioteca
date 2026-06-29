from fastapi import FastAPI

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
register_routes(biblioteca)


@biblioteca.get("/health")
async def root():
    return {"status": "ok"}
