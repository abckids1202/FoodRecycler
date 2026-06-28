from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.db import get_db
from app.database.models import Analysis, NotificationLog, NotificationPreference, RecipeCookingSession, Recommendation, User, UserFeedback
from app.schemas.admin import AdminMetric, AdminRecentUser, AdminSummary


router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(x_user_email: str | None = Header(default=None)) -> str:
    email = (x_user_email or "").strip().lower()
    if not email or email not in settings.admin_email_set:
        raise HTTPException(status_code=403, detail="Admin access is not enabled for this account.")
    return email


@router.get("/summary", response_model=AdminSummary)
def admin_summary(_: str = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).count()
    analyses = db.query(Analysis).count()
    recommendations = db.query(Recommendation).count()
    sessions = db.query(RecipeCookingSession).count()
    finished_sessions = db.query(RecipeCookingSession).filter(RecipeCookingSession.status == "finished").count()
    stopped_sessions = db.query(RecipeCookingSession).filter(RecipeCookingSession.status == "stopped").count()
    feedback_count = db.query(UserFeedback).count()
    reminder_opt_ins = db.query(NotificationPreference).filter(NotificationPreference.stopped_at.is_(None)).count()
    reminder_logs = db.query(NotificationLog).count()
    reactivated = db.query(NotificationPreference).filter(NotificationPreference.last_reactivated_at.is_not(None)).count()
    reactivation_rate = round((reactivated / reminder_opt_ins) * 100, 1) if reminder_opt_ins else 0.0

    recent = db.query(User).order_by(User.created_at.desc()).limit(8).all()
    return AdminSummary(
        totals=[
            AdminMetric(label="Registered users", value=users),
            AdminMetric(label="Leftover analyses", value=analyses),
            AdminMetric(label="AI recipe recommendations", value=recommendations),
            AdminMetric(label="Recipes started", value=sessions),
            AdminMetric(label="Recipes finished", value=finished_sessions),
            AdminMetric(label="Recipes stopped", value=stopped_sessions),
            AdminMetric(label="Feedback responses", value=feedback_count),
            AdminMetric(label="Reminder opt-ins", value=reminder_opt_ins),
            AdminMetric(label="Reminder logs", value=reminder_logs),
        ],
        recent_users=[
            AdminRecentUser(
                id=user.id,
                name=user.name,
                email=user.email,
                provider=user.auth_provider,
                reminder_channel=user.reminder_channel or "none",
                created_at=user.created_at,
            )
            for user in recent
        ],
        reminder_reactivation_rate=reactivation_rate,
        privacy_note="Admin data is limited to product analytics fields. Do not expose OpenAI keys, Google secrets, passwords, or raw private messages.",
    )
