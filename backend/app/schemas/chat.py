from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.recipe import RecommendationResponse


class ChatMessageRequest(BaseModel):
    user_id: int | None = None
    message: str = Field(min_length=2)
    condition: str = "unknown"


class ChatMessageResponse(BaseModel):
    reply: str
    analysis_id: int
    detected_labels: list[str]
    recommendations: list[RecommendationResponse]
