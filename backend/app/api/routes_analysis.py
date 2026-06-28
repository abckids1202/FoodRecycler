from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session, selectinload

from app.core.storage import save_upload
from app.database.db import get_db
from app.database.models import Analysis, DetectedLeftover
from app.schemas.analysis import AnalysisClarificationRequest, AnalysisResponse, TextAnalysisRequest
from app.services.image_identifier_service import identify_leftovers_from_image
from app.services.recommendation_service import recommend_for_analysis
from app.services.safety_service import evaluate_safety
from app.services.text_analyzer_service import analyze_text


router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/text", response_model=AnalysisResponse)
def analyze_text_input(payload: TextAnalysisRequest, db: Session = Depends(get_db)):
    detected_items, initial_safety_notes = analyze_text(payload.text)
    safety_level, safety_notes = evaluate_safety(payload.condition, initial_safety_notes)

    analysis = Analysis(
        user_id=payload.user_id,
        input_type="text",
        condition=payload.condition,
        source_text=payload.text,
        safety_level=safety_level,
        safety_notes=safety_notes,
    )
    db.add(analysis)
    db.flush()

    for item in detected_items:
        db.add(DetectedLeftover(analysis_id=analysis.id, **item))

    db.commit()
    db.refresh(analysis)
    analysis = _get_analysis_or_404(db, analysis.id)
    recommend_for_analysis(db, analysis)
    return analysis


@router.post("/upload", response_model=AnalysisResponse)
def analyze_image_upload(
    user_id: int | None = Form(default=None),
    condition: str = Form(default="unknown"),
    clarification: str | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_path = save_upload(file)
    detected_items, initial_safety_notes = identify_leftovers_from_image(image_path)
    if clarification:
        clarified_items, clarified_safety_notes = analyze_text(clarification)
        existing_labels = {item["label"] for item in detected_items}
        detected_items.extend(item for item in clarified_items if item["label"] not in existing_labels)
        initial_safety_notes.extend(clarified_safety_notes)
    safety_level, safety_notes = evaluate_safety(condition, initial_safety_notes)

    analysis = Analysis(
        user_id=user_id,
        input_type="image",
        condition=condition,
        source_text=clarification,
        image_path=image_path,
        safety_level=safety_level,
        safety_notes=safety_notes,
    )
    db.add(analysis)
    db.flush()

    for item in detected_items:
        db.add(DetectedLeftover(analysis_id=analysis.id, **item))

    db.commit()
    db.refresh(analysis)
    analysis = _get_analysis_or_404(db, analysis.id)
    recommend_for_analysis(db, analysis)
    return analysis


@router.post("/{analysis_id}/clarify", response_model=AnalysisResponse)
def clarify_analysis_items(
    analysis_id: int,
    payload: AnalysisClarificationRequest,
    db: Session = Depends(get_db),
):
    analysis = _get_analysis_or_404(db, analysis_id)
    clarification = payload.text.strip()
    if not clarification:
        return analysis

    clarified_items, clarified_safety_notes = analyze_text(clarification)
    existing_labels = {item.label for item in analysis.items}

    for item in clarified_items:
        label = item["label"]
        if label in existing_labels:
            continue
        if label == "unknown_food_leftover" and existing_labels:
            continue
        db.add(DetectedLeftover(analysis_id=analysis.id, **item))
        existing_labels.add(label)

    notes = list(analysis.safety_notes or [])
    notes.extend(clarified_safety_notes)
    safety_level, safety_notes = evaluate_safety(analysis.condition, notes)
    analysis.safety_level = safety_level
    analysis.safety_notes = safety_notes

    previous_text = analysis.source_text or ""
    analysis.source_text = (
        f"{previous_text}\n\nClarification: {clarification}".strip()
        if previous_text
        else clarification
    )

    db.commit()
    analysis = _get_analysis_or_404(db, analysis.id)
    recommend_for_analysis(db, analysis)
    return _get_analysis_or_404(db, analysis.id)


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    return _get_analysis_or_404(db, analysis_id)


@router.get("/history/user/{user_id}", response_model=list[AnalysisResponse])
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Analysis)
        .options(selectinload(Analysis.items), selectinload(Analysis.recommendations))
        .filter(Analysis.user_id == user_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )


def _get_analysis_or_404(db: Session, analysis_id: int) -> Analysis:
    analysis = (
        db.query(Analysis)
        .options(selectinload(Analysis.items), selectinload(Analysis.recommendations))
        .filter(Analysis.id == analysis_id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return analysis
