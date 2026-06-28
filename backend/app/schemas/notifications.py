from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class NotificationPreferenceRequest(BaseModel):
    user_id: int
    email_enabled: bool = False
    whatsapp_enabled: bool = False
    consent_text: str | None = None


class NotificationPreferenceResponse(BaseModel):
    user_id: int
    email_enabled: bool
    whatsapp_enabled: bool
    reminder_stage: int
    next_reminder_at: datetime | None
    stopped_at: datetime | None


class NotificationRunResponse(BaseModel):
    processed: int
    sent: int
    skipped: int


class ReminderPreview(BaseModel):
    stage: int = Field(ge=1, le=3)
    subject: str
    message: str
