from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.core.config import settings


allowed_content_types = {"image/jpeg", "image/png", "image/webp"}


def save_upload(file: UploadFile) -> str:
    if file.content_type not in allowed_content_types:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP images are supported.")

    settings.upload_path.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename or "upload.jpg").suffix.lower() or ".jpg"
    safe_name = f"{uuid4().hex}{suffix}"
    destination = settings.upload_path / safe_name

    with destination.open("wb") as output:
        output.write(file.file.read())

    return str(destination)
