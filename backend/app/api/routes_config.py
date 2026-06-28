from fastapi import APIRouter

from app.core.config import settings
from app.services.openai_service import openai_is_configured


router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("/status")
def config_status():
    missing_google_fields = [
        key
        for key, value in {
            "GOOGLE_CLIENT_ID": settings.google_client_id,
            "GOOGLE_CLIENT_SECRET": settings.google_client_secret,
            "GOOGLE_REDIRECT_URI": settings.google_redirect_uri,
        }.items()
        if not value
    ]
    return {
        "database_url_type": "postgresql" if settings.database_url.startswith("postgresql") else "sqlite",
        "openai_configured": openai_is_configured(),
        "text_analyzer_mode": settings.text_analyzer_mode,
        "leftover_identifier_mode": settings.leftover_identifier_mode,
        "recipe_response_mode": settings.recipe_response_mode,
        "google_auth_configured": bool(settings.google_client_id and settings.google_client_secret),
        "missing_google_fields": missing_google_fields,
    }
