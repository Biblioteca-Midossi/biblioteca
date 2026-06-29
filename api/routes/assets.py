from pathlib import Path
from typing import Literal
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse


router = APIRouter(
    prefix="/assets",
    tags=["assets"],
    responses={
        404: {"detail": "Thumbnail not found"},
        200: {"content": {"image/png": {}}},
    },
)


@router.get("/thumbnails/{book_id}", response_class=FileResponse)
async def get_thumbnail(book_id: int | Literal[".no-thumbnail-found"]):
    thumbnail_path = Path(f"./assets/thumbnails/{book_id}")
    if thumbnail_path.exists():
        return FileResponse(
            thumbnail_path,
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )
    else:
        raise HTTPException(status_code=404, detail="Thumbnail not found")
