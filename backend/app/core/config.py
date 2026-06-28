from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    database_url: str = "sqlite:///./foodloop.db"
    frontend_url: str = "http://localhost:5173"
    upload_dir: str = "app/uploads"
    food_json_path: str = "app/data/traditional_indonesian_foods.json"
    text_analyzer_mode: str = "rules"
    leftover_identifier_mode: str = "mock"
    recipe_response_mode: str = "rules"
    openai_api_key: str = ""
    openai_text_model: str = "gpt-5.5"
    openai_vision_model: str = "gpt-5.5"
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://127.0.0.1:8000/api/auth/google/callback"

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8")

    @property
    def upload_path(self) -> Path:
        return Path(self.upload_dir)

    @property
    def food_json_file(self) -> Path:
        return Path(self.food_json_path)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
