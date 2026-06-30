from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import ContactMessage
from app.schemas.contact import ContactMessageCreate, ContactMessageResponse


router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("/messages", response_model=ContactMessageResponse)
def create_contact_message(payload: ContactMessageCreate, db: Session = Depends(get_db)):
    message = payload.message.strip()
    if len(message) < 5:
        raise HTTPException(status_code=400, detail="Message is too short.")

    contact = ContactMessage(
        user_id=payload.user_id,
        name=(payload.name or "").strip() or None,
        email=(payload.email or "").strip() or None,
        language=payload.language if payload.language in {"id", "en"} else "id",
        topic=(payload.topic or "help").strip()[:120],
        message=message,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact
