from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Analysis, FoodRecipe, RecipeCookingSession, Recommendation
from app.schemas.recipe import (
    CookingSessionCreateRequest,
    CookingSessionFinishRequest,
    CookingSessionHistoryResponse,
    CookingSessionProgressRequest,
    CookingSessionResponse,
    CookingSessionStopRequest,
    RecommendationDetailResponse,
    RecommendationListResponse,
    RecipeResponse,
)
from app.services.recommendation_service import recommend_for_analysis


router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.get("", response_model=list[RecipeResponse])
def list_recipes(db: Session = Depends(get_db)):
    return db.query(FoodRecipe).order_by(FoodRecipe.name.asc()).all()


@router.post("/recommend/{analysis_id}", response_model=RecommendationListResponse)
def recommend_recipes(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    recommendations = recommend_for_analysis(db, analysis)
    return RecommendationListResponse(analysis_id=analysis_id, recommendations=recommendations)


@router.get("/recommend/{analysis_id}", response_model=RecommendationListResponse)
def get_recommendations(analysis_id: int, db: Session = Depends(get_db)):
    recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.analysis_id == analysis_id)
        .order_by(Recommendation.score.desc())
        .all()
    )
    return RecommendationListResponse(analysis_id=analysis_id, recommendations=recommendations)


@router.get("/recommendation/{recommendation_id}", response_model=RecommendationDetailResponse)
def get_recommendation_detail(recommendation_id: int, db: Session = Depends(get_db)):
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    analysis = db.query(Analysis).filter(Analysis.id == recommendation.analysis_id).first()
    recipe = db.query(FoodRecipe).filter(FoodRecipe.recipe_key == recommendation.recipe_key).first()
    return RecommendationDetailResponse(
        id=recommendation.id,
        analysis_id=recommendation.analysis_id,
        recipe_key=recommendation.recipe_key,
        recipe_name=recommendation.recipe_name,
        score=recommendation.score,
        reason=recommendation.reason,
        warnings=recommendation.warnings or [],
        detected_leftovers=[item.display_name for item in analysis.items if not item.is_safety_flag] if analysis else [],
        safety_level=analysis.safety_level if analysis else "needs_review",
        safety_notes=analysis.safety_notes if analysis else [],
        recipe=recipe,
    )


@router.post("/recommendation/{recommendation_id}/sessions", response_model=CookingSessionResponse)
def start_cooking_session(
    recommendation_id: int,
    payload: CookingSessionCreateRequest,
    db: Session = Depends(get_db),
):
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    session = RecipeCookingSession(
        recommendation_id=recommendation_id,
        user_id=payload.user_id,
        status="started",
        current_step=0,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/sessions/{session_id}/finish", response_model=CookingSessionResponse)
def finish_cooking_session(
    session_id: int,
    payload: CookingSessionFinishRequest,
    db: Session = Depends(get_db),
):
    session = db.query(RecipeCookingSession).filter(RecipeCookingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Cooking session not found.")

    session.status = "finished"
    session.current_step = payload.current_step
    session.finished_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session


@router.post("/sessions/{session_id}/stop", response_model=CookingSessionResponse)
def stop_cooking_session(
    session_id: int,
    payload: CookingSessionStopRequest,
    db: Session = Depends(get_db),
):
    session = db.query(RecipeCookingSession).filter(RecipeCookingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Cooking session not found.")

    session.status = "stopped"
    session.current_step = payload.current_step
    session.problem_note = payload.problem_note
    session.stopped_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session


@router.post("/sessions/{session_id}/progress", response_model=CookingSessionResponse)
def update_cooking_session_progress(
    session_id: int,
    payload: CookingSessionProgressRequest,
    db: Session = Depends(get_db),
):
    session = db.query(RecipeCookingSession).filter(RecipeCookingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Cooking session not found.")
    if session.status != "started":
        raise HTTPException(status_code=400, detail="Only started sessions can update progress.")

    session.current_step = payload.current_step
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/user/{user_id}", response_model=list[CookingSessionHistoryResponse])
def get_user_cooking_sessions(user_id: int, db: Session = Depends(get_db)):
    sessions = (
        db.query(RecipeCookingSession)
        .filter(RecipeCookingSession.user_id == user_id)
        .order_by(RecipeCookingSession.started_at.desc())
        .all()
    )
    recommendation_ids = [item.recommendation_id for item in sessions]
    recommendations = db.query(Recommendation).filter(Recommendation.id.in_(recommendation_ids)).all() if recommendation_ids else []
    recommendation_by_id = {item.id: item for item in recommendations}
    return [_session_history_response(item, recommendation_by_id.get(item.recommendation_id)) for item in sessions]


@router.get("/sessions/{session_id}", response_model=CookingSessionHistoryResponse)
def get_cooking_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(RecipeCookingSession).filter(RecipeCookingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Cooking session not found.")
    recommendation = db.query(Recommendation).filter(Recommendation.id == session.recommendation_id).first()
    return _session_history_response(session, recommendation)


def _session_history_response(session: RecipeCookingSession, recommendation: Recommendation | None):
    return CookingSessionHistoryResponse(
        id=session.id,
        recommendation_id=session.recommendation_id,
        user_id=session.user_id,
        status=session.status,
        current_step=session.current_step,
        problem_note=session.problem_note,
        started_at=session.started_at,
        finished_at=session.finished_at,
        stopped_at=session.stopped_at,
        recommendation_name=recommendation.recipe_name if recommendation else "Unknown recipe",
        recipe_key=recommendation.recipe_key if recommendation else "unknown",
        analysis_id=recommendation.analysis_id if recommendation else 0,
    )


@router.get("/{recipe_key}", response_model=RecipeResponse)
def get_recipe(recipe_key: str, db: Session = Depends(get_db)):
    recipe = db.query(FoodRecipe).filter(FoodRecipe.recipe_key == recipe_key).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found.")
    return recipe
