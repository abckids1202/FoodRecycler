from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import NotificationPreference, User
from app.schemas.notifications import NotificationPreferenceRequest, NotificationPreferenceResponse, NotificationRunResponse, ReminderPreview
from app.services.notification_service import REMINDER_COPY, disable_preference, ensure_preference, run_due_reminders


router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/preferences/{user_id}", response_model=NotificationPreferenceResponse)
def get_preferences(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    preference = db.query(NotificationPreference).filter(NotificationPreference.user_id == user_id).first()
    if not preference:
        return NotificationPreferenceResponse(user_id=user_id, email_enabled=False, whatsapp_enabled=False, reminder_stage=0, next_reminder_at=None, stopped_at=None)
    return NotificationPreferenceResponse(
        user_id=user_id,
        email_enabled=preference.email_enabled,
        whatsapp_enabled=preference.whatsapp_enabled,
        reminder_stage=preference.reminder_stage,
        next_reminder_at=preference.next_reminder_at,
        stopped_at=preference.stopped_at,
    )


@router.post("/preferences", response_model=NotificationPreferenceResponse)
def save_preferences(payload: NotificationPreferenceRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    preference = ensure_preference(db, user, email_enabled=payload.email_enabled, whatsapp_enabled=payload.whatsapp_enabled, consent_text=payload.consent_text)
    return NotificationPreferenceResponse(
        user_id=user.id,
        email_enabled=preference.email_enabled,
        whatsapp_enabled=preference.whatsapp_enabled,
        reminder_stage=preference.reminder_stage,
        next_reminder_at=preference.next_reminder_at,
        stopped_at=preference.stopped_at,
    )


@router.post("/preferences/{user_id}/disable", response_model=NotificationPreferenceResponse)
def disable_preferences(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    preference = disable_preference(db, user)
    return NotificationPreferenceResponse(
        user_id=user.id,
        email_enabled=False,
        whatsapp_enabled=False,
        reminder_stage=preference.reminder_stage if preference else 0,
        next_reminder_at=None,
        stopped_at=preference.stopped_at if preference else None,
    )


@router.post("/run-due", response_model=NotificationRunResponse)
def run_due(db: Session = Depends(get_db)):
    result = run_due_reminders(db)
    return NotificationRunResponse(**result)


@router.get("/preview", response_model=list[ReminderPreview])
def reminder_preview():
    return [ReminderPreview(stage=stage, subject=value["subject"], message=value["message"]) for stage, value in REMINDER_COPY.items()]
