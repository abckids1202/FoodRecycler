from __future__ import annotations

from urllib.parse import urlencode

import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.db import get_db
from app.database.models import User
from app.schemas.auth import DemoAuthRequest, UserResponse


router = APIRouter(prefix="/api/auth", tags=["auth"])


def upsert_user(
    db: Session,
    *,
    name: str,
    email: str,
    provider: str,
    phone: str | None = None,
    age: int | None = None,
    reason: str | None = None,
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.name = name
        user.auth_provider = provider
        if phone is not None:
            user.phone = phone
        if age is not None:
            user.age = age
        if reason is not None:
            user.use_reason = reason
    else:
        user = User(
            name=name,
            email=email,
            auth_provider=provider,
            phone=phone,
            age=age,
            use_reason=reason,
        )
        db.add(user)

    db.commit()
    db.refresh(user)
    return user


@router.post("/demo", response_model=UserResponse)
def demo_auth(payload: DemoAuthRequest, db: Session = Depends(get_db)):
    user = upsert_user(
        db,
        name=payload.name,
        email=payload.email,
        provider=payload.provider,
        phone=payload.phone,
        age=payload.age,
        reason=payload.reason,
    )
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        provider=user.auth_provider,
        phone=user.phone,
        age=user.age,
        reason=user.use_reason,
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
            "oauth_age": user.age or "",
            "oauth_reason": user.use_reason or "",
        }
    )
    return RedirectResponse(f"{settings.frontend_url}/welcome?{redirect_query}")
