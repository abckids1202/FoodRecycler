from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel


class BotPlatform(str, Enum):
    telegram = "telegram"
    whatsapp = "whatsapp"


class BotReply(BaseModel):
    messages: list[str]
    document_url: str | None = None
    document_path: str | None = None
    state: str


class BotIncomingMessage(BaseModel):
    platform: BotPlatform
    platform_user_id: str
    chat_id: str
    display_name: str | None = None
    text: str | None = None
    image_path: str | None = None
    raw: dict[str, Any] = {}
