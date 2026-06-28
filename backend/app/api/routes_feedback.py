from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import UserFeedback
from app.schemas.feedback import ExperienceFeedbackRequest, ExperienceFeedbackResponse


router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post("/experience", response_model=ExperienceFeedbackResponse)
def save_experience_feedback(payload: ExperienceFeedbackRequest, db: Session = Depends(get_db)):
    feedback = UserFeedback(
        user_id=payload.user_id,
        rating=payload.rating,
        context=payload.context,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback
