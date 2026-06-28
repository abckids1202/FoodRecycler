from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.services.pdf_service import build_recommendation_pdf


router = APIRouter(prefix="/api/pdf", tags=["pdf"])


@router.post("/generate/{recommendation_id}")
def generate_pdf(recommendation_id: int, db: Session = Depends(get_db)):
    output_path = build_recommendation_pdf(db, recommendation_id)
    if not output_path:
        raise HTTPException(status_code=404, detail="Recommendation not found.")
    return {"recommendation_id": recommendation_id, "download_url": f"/api/pdf/download/{recommendation_id}"}


@router.get("/download/{recommendation_id}")
def download_pdf(recommendation_id: int, db: Session = Depends(get_db)):
    output_path = build_recommendation_pdf(db, recommendation_id)
    if not output_path:
        raise HTTPException(status_code=404, detail="Recommendation not found.")
    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename=f"foodloop-recommendation-{recommendation_id}.pdf",
    )
