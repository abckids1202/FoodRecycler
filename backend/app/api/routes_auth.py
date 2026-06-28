from __future__ import annotations

from datetime import datetime, timedelta
from urllib.parse import urlencode

import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.db import get_db
from app.database.models import NotificationPreference, User
from app.schemas.auth import DemoAuthRequest, UserResponse


router = APIRouter(prefix="/api/auth", tags=["auth"])


def upsert_user(
    db: Session,
    *,
    name: str,
    email: str,
    provider: str,
    phone: str | None = None,
    phone_country_code: str | None = None,
    age: int | None = None,
    reason: str | None = None,
    reminder_opt_in: bool | None = None,
    reminder_channel: str | None = None,
) -> User:
    normalized_phone = normalize_phone(phone, phone_country_code)
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.name = name
        user.auth_provider = provider
        if phone is not None:
            user.phone = normalized_phone["raw"]
            user.phone_country_code = normalized_phone["country_code"]
            user.phone_national_number = normalized_phone["national_number"]
            user.phone_e164 = normalized_phone["e164"]
        if age is not None:
            user.age = age
        if reason is not None:
            user.use_reason = reason
        if reminder_opt_in is not None:
            user.reminder_opt_in = reminder_opt_in
            user.reminder_channel = reminder_channel if reminder_opt_in else "none"
    else:
        user = User(
            name=name,
            email=email,
            auth_provider=provider,
            phone=normalized_phone["raw"],
            phone_country_code=normalized_phone["country_code"],
            phone_national_number=normalized_phone["national_number"],
            phone_e164=normalized_phone["e164"],
            age=age,
            use_reason=reason,
            reminder_opt_in=bool(reminder_opt_in),
            reminder_channel=reminder_channel if reminder_opt_in else "none",
        )
        db.add(user)

    db.commit()
    db.refresh(user)
    if reminder_opt_in is not None:
        sync_notification_preference(db, user)
    return user


@router.post("/demo", response_model=UserResponse)
def demo_auth(payload: DemoAuthRequest, db: Session = Depends(get_db)):
    user = upsert_user(
        db,
        name=payload.name,
        email=payload.email,
        provider=payload.provider,
        phone=payload.phone,
        phone_country_code=payload.phone_country_code,
        age=payload.age,
        reason=payload.reason,
        reminder_opt_in=payload.reminder_opt_in,
        reminder_channel=payload.reminder_channel,
    )
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        provider=user.auth_provider,
        phone=user.phone,
        phone_country_code=user.phone_country_code,
        phone_national_number=user.phone_national_number,
        phone_e164=user.phone_e164,
        age=user.age,
        reason=user.use_reason,
        reminder_opt_in=user.reminder_opt_in,
        reminder_channel=user.reminder_channel,
    )


@router.get("/google/start")
def google_start():
    if not settings.google_client_id or not settings.google_redirect_uri:
        raise HTTPException(status_code=400, detail="Google OAuth is not configured in backend .env.")

    query = urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "online",
            "prompt": "select_account",
        }
    )
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}")


@router.get("/google/callback")
def google_callback(code: str | None = None, db: Session = Depends(get_db)):
    if not code:
        return RedirectResponse(f"{settings.frontend_url}/welcome?oauth_error=missing_google_code")
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=400, detail="Google OAuth credentials are not configured in backend .env.")

    token_response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_code",
        },
        timeout=20,
    )
    if token_response.status_code >= 400:
        raise HTTPException(status_code=400, detail="Google token exchange failed.")

    access_token = token_response.json().get("access_token")
    profile_response = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=20,
    )
    if profile_response.status_code >= 400:
        raise HTTPException(status_code=400, detail="Google profile lookup failed.")

    profile = profile_response.json()
    email = profile.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google profile did not include an email.")

    user = upsert_user(
        db,
        name=profile.get("name") or email.split("@")[0],
        email=email,
        provider="google",
    )
    redirect_query = urlencode(
        {
            "oauth_id": user.id,
            "oauth_name": user.name,
            "oauth_email": user.email,
            "oauth_provider": user.auth_provider,
            "oauth_phone": user.phone or "",
            "oauth_phone_country_code": user.phone_country_code or "",
            "oauth_reminder_opt_in": "1" if user.reminder_opt_in else "",
            "oauth_reminder_channel": user.reminder_channel or "none",
            "oauth_age": user.age or "",
            "oauth_reason": user.use_reason or "",
        }
    )
    return RedirectResponse(f"{settings.frontend_url}/welcome?{redirect_query}")


def normalize_phone(phone: str | None, country_code: str | None) -> dict[str, str | None]:
    if not phone:
        return {"raw": None, "country_code": country_code or "+62", "national_number": None, "e164": None}
    code = (country_code or "+62").strip()
    if not code.startswith("+"):
        code = f"+{code}"
    digits = "".join(ch for ch in phone if ch.isdigit())
    if not digits:
        return {"raw": phone, "country_code": code, "national_number": None, "e164": None}
    national = digits
    code_digits = code.replace("+", "")
    if national.startswith(code_digits):
        national = national[len(code_digits):]
    if code == "+62" and national.startswith("0"):
        national = national[1:]
    e164 = f"{code}{national}"
    return {"raw": phone, "country_code": code, "national_number": national, "e164": e164}


def sync_notification_preference(db: Session, user: User) -> None:
    preference = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
    if not user.reminder_opt_in:
        if preference:
            preference.email_enabled = False
            preference.whatsapp_enabled = False
            preference.next_reminder_at = None
        db.commit()
        return
    if not preference:
        preference = NotificationPreference(user_id=user.id)
        db.add(preference)
    preference.email_enabled = user.reminder_channel in {"email", "email_whatsapp"}
    preference.whatsapp_enabled = user.reminder_channel in {"whatsapp", "email_whatsapp"}
    preference.consent_text = "User opted into FoodLoop reminders during registration/profile completion."
    preference.next_reminder_at = datetime.utcnow() + timedelta(days=1)
    preference.stopped_at = None
    db.commit()
