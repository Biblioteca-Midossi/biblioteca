import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import register_routes
from utils.Logger import setup_logger, log

setup_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run at startup
    log.info("Starting Application..")
    await asyncio.create_task(register_routes(app))
    log.info("Application started and ready!")
    yield
    log.info("Shutting down..")


biblioteca = FastAPI(
    lifespan=lifespan,
    root_path="/api",
    swagger_ui_parameters={
        "syntaxHighlight.theme": "obsidian",
    },
    redoc_url=None,
)

origins_regex = r"(https?:\/\/)?(192)\.(168)(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){2}(?::8001)?|localhost(?::8001)?|127.0.0.1(?::8001)?"

# noinspection PyTypeChecker
biblioteca.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    # allow_headers = ['*'],
    # allow_origin_regex = origins_regex,
)


@biblioteca.get("")
async def root():
    return {"message": "Hello World"}
