from __future__ import annotations

from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Analysis, DetectedLeftover, NotificationPreference, RecipeCookingSession, Recommendation
from app.schemas.dashboard import DashboardSummary, FrequencyItem


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(user_id: int | None = None, db: Session = Depends(get_db)):
    analyses_query = db.query(Analysis)
    recommendations_query = db.query(Recommendation)
    leftovers_query = db.query(DetectedLeftover)

    if user_id:
        analyses_query = analyses_query.filter(Analysis.user_id == user_id)
        recommendations_query = recommendations_query.join(Analysis).filter(Analysis.user_id == user_id)
        leftovers_query = leftovers_query.join(Analysis).filter(Analysis.user_id == user_id)

    total_analyses = analyses_query.count()
    total_food_ideas = recommendations_query.count()
    all_cooking_sessions_query = db.query(RecipeCookingSession)
    if user_id:
        all_cooking_sessions_query = all_cooking_sessions_query.filter(RecipeCookingSession.user_id == user_id)
    cooking_sessions = all_cooking_sessions_query.all()
    recipes_started = len(cooking_sessions)
    recipes_finished = sum(1 for item in cooking_sessions if item.status == "finished")
    recipes_stopped = sum(1 for item in cooking_sessions if item.status == "stopped")
    saved_recipe_count = recipes_finished
    completion_rate = round((recipes_finished / recipes_started) * 100, 1) if recipes_started else 0.0

    recommendation_by_id = {}
    if cooking_sessions:
        recommendation_ids = [item.recommendation_id for item in cooking_sessions]
        recommendations = db.query(Recommendation).filter(Recommendation.id.in_(recommendation_ids)).all()
        recommendation_by_id = {item.id: item for item in recommendations}

    completed_counts = Counter(
        recommendation_by_id[item.recommendation_id].recipe_name
        for item in cooking_sessions
        if item.status == "finished" and item.recommendation_id in recommendation_by_id
    )
    stopped_counts = Counter(
        recommendation_by_id[item.recommendation_id].recipe_name
        for item in cooking_sessions
        if item.status == "stopped" and item.recommendation_id in recommendation_by_id
    )
    most_completed_recipe = completed_counts.most_common(1)[0][0] if completed_counts else None
    most_stopped_recipe = stopped_counts.most_common(1)[0][0] if stopped_counts else None
    reminders_query = db.query(NotificationPreference)
    if user_id:
        reminders_query = reminders_query.filter(NotificationPreference.user_id == user_id)
    reminders = reminders_query.all()
    active_reminders = [item for item in reminders if item.stopped_at is None]
    reactivated_reminders = [item for item in reminders if item.last_reactivated_at is not None]
    reminder_reactivation_rate = round((len(reactivated_reminders) / len(active_reminders)) * 100, 1) if active_reminders else 0.0

    top_leftover_row = (
        leftovers_query.with_entities(DetectedLeftover.label)
        .filter(DetectedLeftover.is_safety_flag.is_(False))
        .all()
    )
    counts = Counter(row[0] for row in top_leftover_row)
    top_leftover = counts.most_common(1)[0][0] if counts else None

    return DashboardSummary(
        total_analyses=total_analyses,
        total_food_ideas=total_food_ideas,
        top_leftover=top_leftover,
        saved_recipe_count=saved_recipe_count,
        recipes_started=recipes_started,
        recipes_finished=recipes_finished,
        recipes_stopped=recipes_stopped,
        completion_rate=completion_rate,
        most_completed_recipe=most_completed_recipe,
        most_stopped_recipe=most_stopped_recipe,
        reminder_reactivation_rate=reminder_reactivation_rate,
    )


@router.get("/leftovers", response_model=list[FrequencyItem])
def leftover_frequency(user_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(DetectedLeftover.display_name).filter(DetectedLeftover.is_safety_flag.is_(False))
    if user_id:
        query = query.join(Analysis).filter(Analysis.user_id == user_id)
    labels = query.all()
    counts = Counter(row[0] for row in labels)
    return [FrequencyItem(name=name, count=count) for name, count in counts.most_common(10)]


@router.get("/recipes", response_model=list[FrequencyItem])
def recipe_frequency(user_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Recommendation.recipe_name)
    if user_id:
        query = query.join(Analysis).filter(Analysis.user_id == user_id)
    names = query.all()
    counts = Counter(row[0] for row in names)
    return [FrequencyItem(name=name, count=count) for name, count in counts.most_common(10)]


@router.get("/stop-reasons", response_model=list[FrequencyItem])
def stop_reason_frequency(user_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(RecipeCookingSession.problem_note).filter(RecipeCookingSession.status == "stopped")
    if user_id:
        query = query.filter(RecipeCookingSession.user_id == user_id)
    notes = [row[0] or "No reason provided" for row in query.all()]
    counts = Counter(_normalize_stop_reason(note) for note in notes)
    return [FrequencyItem(name=name, count=count) for name, count in counts.most_common(10)]


def _normalize_stop_reason(note: str) -> str:
    lowered = note.lower()
    if any(word in lowered for word in ["bau", "smell", "busuk", "asam"]):
        return "Smell/freshness concern"
    if any(word in lowered for word in ["bahan", "ingredient", "missing"]):
        return "Missing ingredient"
    if any(word in lowered for word in ["lendir", "slimy", "jamur", "mold", "warna"]):
        return "Spoilage sign"
    if any(word in lowered for word in ["waktu", "time", "lama"]):
        return "Storage/time concern"
    return note[:60]
