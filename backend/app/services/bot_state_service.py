from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from app.database.models import BotConversation, BotMessage


def get_or_create_conversation(
    db: Session,
    *,
    platform: str,
    platform_user_id: str,
    display_name: str | None = None,
) -> BotConversation:
    conversation = (
        db.query(BotConversation)
        .filter(
            BotConversation.platform == platform,
            BotConversation.platform_user_id == platform_user_id,
        )
        .first()
    )
    if conversation:
        if display_name and conversation.display_name != display_name:
            conversation.display_name = display_name
            conversation.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(conversation)
        return conversation

    conversation = BotConversation(
        platform=platform,
        platform_user_id=platform_user_id,
        display_name=display_name,
        language="id",
        state="START",
        context_json={},
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def save_conversation(
    db: Session,
    conversation: BotConversation,
    *,
    state: str | None = None,
    context: dict | None = None,
    language: str | None = None,
    last_analysis_id: int | None = None,
    last_recommendation_id: int | None = None,
) -> BotConversation:
    if state is not None:
        conversation.state = state
    if context is not None:
        conversation.context_json = context
    if language is not None:
        conversation.language = language
    if last_analysis_id is not None:
        conversation.last_analysis_id = last_analysis_id
    if last_recommendation_id is not None:
        conversation.last_recommendation_id = last_recommendation_id
    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conversation)
    return conversation


def log_bot_message(
    db: Session,
    *,
    conversation_id: int,
    direction: str,
    message_type: str = "text",
    text: str | None = None,
    media_url: str | None = None,
) -> None:
    db.add(
        BotMessage(
            conversation_id=conversation_id,
            direction=direction,
            message_type=message_type,
            text=text,
            media_url=media_url,
        )
    )
    db.commit()
