from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.db import get_db
from app.schemas.bot import BotIncomingMessage, BotPlatform
from app.services.bot_conversation_service import handle_bot_message
from app.services.telegram_service import TelegramService


router = APIRouter(prefix="/api/bots/telegram", tags=["bots"])


@router.post("/webhook")
async def telegram_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    message = payload.get("message") or payload.get("edited_message") or {}
    if not message:
        return {"ok": True}

    chat = message.get("chat") or {}
    sender = message.get("from") or {}
    chat_id = str(chat.get("id") or "")
    platform_user_id = str(sender.get("id") or chat_id)
    display_name = " ".join(
        item for item in [sender.get("first_name"), sender.get("last_name")] if item
    ) or sender.get("username")

    text = message.get("text") or message.get("caption") or ""
    image_path = None
    telegram = TelegramService()

    if message.get("photo"):
        largest_photo = sorted(message["photo"], key=lambda item: item.get("file_size", 0))[-1]
        image_path = _download_telegram_file(telegram, largest_photo["file_id"], platform_user_id)
    elif _is_image_document(message.get("document")):
        image_path = _download_telegram_file(telegram, message["document"]["file_id"], platform_user_id)

    incoming = BotIncomingMessage(
        platform=BotPlatform.telegram,
        platform_user_id=platform_user_id,
        chat_id=chat_id,
        display_name=display_name,
        text=text,
        image_path=image_path,
        raw=payload,
    )
    reply = handle_bot_message(db, incoming)
    for item in reply.messages:
        telegram.send_message(chat_id, item)
    if reply.document_path:
        telegram.send_document(chat_id, reply.document_path)
    return {"ok": True, "state": reply.state}


@router.post("/set-webhook")
def set_telegram_webhook():
    if not settings.public_backend_url:
        raise HTTPException(status_code=400, detail="PUBLIC_BACKEND_URL is not configured.")
    telegram = TelegramService()
    if not telegram.is_configured:
        raise HTTPException(status_code=400, detail="TELEGRAM_BOT_TOKEN is not configured.")
    webhook_url = f"{settings.public_backend_url.rstrip('/')}/api/bots/telegram/webhook"
    return telegram.set_webhook(webhook_url)


def _download_telegram_file(telegram: TelegramService, file_id: str, platform_user_id: str) -> str:
    if not telegram.is_configured:
        raise HTTPException(status_code=400, detail="Telegram bot token is not configured.")
    save_dir = Path(settings.upload_dir) / "bot" / "telegram"
    save_path = save_dir / f"{platform_user_id}-{file_id}.jpg"
    return telegram.download_file(file_id, save_path)


def _is_image_document(document: dict | None) -> bool:
    if not document:
        return False
    mime_type = document.get("mime_type") or ""
    return mime_type.startswith("image/")
