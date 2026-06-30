from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.db import get_db
from app.schemas.bot import BotIncomingMessage, BotPlatform
from app.services.bot_conversation_service import handle_bot_message
from app.services.whatsapp_service import WhatsAppService


router = APIRouter(prefix="/api/bots/whatsapp", tags=["bots"])


@router.get("/webhook")
def verify_whatsapp_webhook(
    hub_mode: str | None = Query(default=None, alias="hub.mode"),
    hub_verify_token: str | None = Query(default=None, alias="hub.verify_token"),
    hub_challenge: str | None = Query(default=None, alias="hub.challenge"),
):
    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_verify_token:
        return Response(content=hub_challenge or "", media_type="text/plain")
    raise HTTPException(status_code=403, detail="WhatsApp webhook verification failed.")


@router.post("/webhook")
async def whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    service = WhatsAppService()
    for message in _extract_messages(payload):
        sender = message.get("from")
        if not sender:
            continue
        text = ""
        image_path = None
        message_type = message.get("type")
        if message_type == "text":
            text = (message.get("text") or {}).get("body") or ""
        elif message_type == "image":
            media_id = (message.get("image") or {}).get("id")
            if media_id:
                image_path = _download_whatsapp_media(service, media_id, sender)
                text = (message.get("image") or {}).get("caption") or ""
        else:
            text = "mulai"

        incoming = BotIncomingMessage(
            platform=BotPlatform.whatsapp,
            platform_user_id=sender,
            chat_id=sender,
            display_name=sender,
            text=text,
            image_path=image_path,
            raw=message,
        )
        reply = handle_bot_message(db, incoming)
        for item in reply.messages:
            service.send_text(sender, item)
        if reply.document_url:
            service.send_document(sender, reply.document_url)
    return {"ok": True}


def _extract_messages(payload: dict) -> list[dict]:
    messages = []
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value") or {}
            messages.extend(value.get("messages") or [])
    return messages


def _download_whatsapp_media(service: WhatsAppService, media_id: str, sender: str) -> str:
    if not service.is_configured:
        raise HTTPException(status_code=400, detail="WhatsApp Cloud API is not configured.")
    save_dir = Path(settings.upload_dir) / "bot" / "whatsapp"
    save_path = save_dir / f"{sender}-{media_id}.jpg"
    return service.download_media(media_id, save_path)
