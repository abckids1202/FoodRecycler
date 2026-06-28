from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ExperienceFeedbackRequest(BaseModel):
    user_id: int | None = None
    rating: int = Field(ge=1, le=5)
    context: str = Field(default="experience_prompt", max_length=80)


class ExperienceFeedbackResponse(BaseModel):
    id: int
    user_id: int | None
    rating: int
    context: str
    created_at: datetime

    model_config = {"from_attributes": True}
