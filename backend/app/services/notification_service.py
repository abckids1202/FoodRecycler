from __future__ import annotations

import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage

from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.models import NotificationLog, NotificationPreference, User


REMINDER_COPY = {
    1: {
        "subject": "Masih ada leftover yang bisa dicek?",
        "message": "Hai {name}, masih ada leftover yang bisa dicek hari ini? FoodLoop bisa bantu cari ide masakan yang aman.",
    },
    2: {
        "subject": "Ide cepat untuk leftover Anda",
        "message": "FoodLoop bisa bantu ubah leftover jadi resep sederhana. Cek sebentar sebelum bahannya terlupakan.",
    },
    3: {
        "subject": "Reminder terakhir dari FoodLoop",
        "message": "Reminder terakhir dari FoodLoop: kalau masih ada sisa makanan, cek keamanan dulu sebelum dimakan ya.",
    },
}


def ensure_preference(db: Session, user: User, *, email_enabled: bool, whatsapp_enabled: bool, consent_text: str | None) -> NotificationPreference:
    preference = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
    now = datetime.utcnow()
    if not preference:
        preference = NotificationPreference(user_id=user.id, created_at=now)
        db.add(preference)
    preference.email_enabled = email_enabled
    preference.whatsapp_enabled = whatsapp_enabled
    preference.consent_text = consent_text
    preference.updated_at = now
    preference.stopped_at = None if (email_enabled or whatsapp_enabled) else now
    preference.reminder_stage = 0 if (email_enabled or whatsapp_enabled) else preference.reminder_stage
    preference.next_reminder_at = now + timedelta(days=1) if (email_enabled or whatsapp_enabled) else None
    user.reminder_opt_in = email_enabled or whatsapp_enabled
    user.reminder_channel = _channel_label(email_enabled, whatsapp_enabled)
    db.commit()
    db.refresh(preference)
    return preference


def disable_preference(db: Session, user: User) -> NotificationPreference | None:
    preference = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
    now = datetime.utcnow()
    if preference:
        preference.email_enabled = False
        preference.whatsapp_enabled = False
        preference.stopped_at = now
        preference.next_reminder_at = None
        preference.updated_at = now
    user.reminder_opt_in = False
    user.reminder_channel = "none"
    db.commit()
    return preference


def run_due_reminders(db: Session) -> dict[str, int]:
    now = datetime.utcnow()
    due = (
        db.query(NotificationPreference)
        .filter(NotificationPreference.stopped_at.is_(None))
        .filter(NotificationPreference.next_reminder_at.is_not(None))
        .filter(NotificationPreference.next_reminder_at <= now)
        .all()
    )
    sent = 0
    skipped = 0
    for preference in due:
        user = db.query(User).filter(User.id == preference.user_id).first()
        if not user:
            skipped += 1
            continue
        next_stage = preference.reminder_stage + 1
        if next_stage > 3:
            preference.stopped_at = now
            preference.next_reminder_at = None
            skipped += 1
            continue
        message = build_reminder_message(user, next_stage)
        status = "skipped"
        provider_response = "No enabled channel"
        if preference.email_enabled:
            status, provider_response = send_email(user.email, message["subject"], message["message"])
        if preference.whatsapp_enabled:
            _log(db, user, "whatsapp", next_stage, "template_required", message["message"], "WhatsApp templates/provider not configured yet")
        _log(db, user, "email", next_stage, status, message["message"], provider_response)
        preference.reminder_stage = next_stage
        preference.next_reminder_at = now + timedelta(days=1) if next_stage < 3 else None
        preference.stopped_at = now if next_stage >= 3 else None
        preference.updated_at = now
        sent += 1 if status == "sent" else 0
        skipped += 0 if status == "sent" else 1
    db.commit()
    return {"processed": len(due), "sent": sent, "skipped": skipped}


def build_reminder_message(user: User, stage: int) -> dict[str, str]:
    template = REMINDER_COPY.get(stage, REMINDER_COPY[3])
    return {
        "subject": template["subject"],
        "message": template["message"].format(name=user.name.split()[0] if user.name else "FoodLoop user"),
    }


def send_email(to_email: str, subject: str, body: str) -> tuple[str, str]:
    if not settings.smtp_host or not settings.smtp_username or not settings.smtp_password:
        return "configured_later", "SMTP is not configured"
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.reminder_email_from
    message["To"] = to_email
    message.set_content(body)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
        if settings.smtp_use_tls:
            server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(message)
    return "sent", "SMTP sent"


def _log(db: Session, user: User, channel: str, stage: int, status: str, message: str, provider_response: str) -> None:
    db.add(NotificationLog(user_id=user.id, channel=channel, stage=stage, status=status, message=message, provider_response=provider_response))


def _channel_label(email_enabled: bool, whatsapp_enabled: bool) -> str:
    if email_enabled and whatsapp_enabled:
        return "email_whatsapp"
    if email_enabled:
        return "email"
    if whatsapp_enabled:
        return "whatsapp"
    return "none"
