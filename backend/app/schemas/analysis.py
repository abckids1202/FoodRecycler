from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.recipe import RecommendationResponse


class TextAnalysisRequest(BaseModel):
    user_id: int | None = None
    text: str = Field(min_length=2)
    condition: str = "unknown"


class AnalysisClarificationRequest(BaseModel):
    text: str = Field(default="", max_length=1200)


class DetectedLeftoverResponse(BaseModel):
    id: int | None = None
    label: str
    display_name: str
    confidence: float
    source: str
    is_safety_flag: bool = False

    model_config = {"from_attributes": True}


class AnalysisResponse(BaseModel):
    id: int
    input_type: str
    condition: str
    source_text: str | None = None
    image_path: str | None = None
    safety_level: str
    safety_notes: list[str]
    items: list[DetectedLeftoverResponse]
    recommendations: list[RecommendationResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}
