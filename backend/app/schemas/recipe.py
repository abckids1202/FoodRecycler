from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class RecipeResponse(BaseModel):
    recipe_key: str
    name: str
    region: str
    leftover_matches: list[str]
    required_safety: list[str]
    ingredients: list[str]
    steps: list[str]
    difficulty: str
    estimated_time: str
    safety_notes: list[str]

    model_config = {"from_attributes": True}


class RecommendationResponse(BaseModel):
    id: int | None = None
    recipe_key: str
    recipe_name: str
    score: int
    reason: str
    warnings: list[str]
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class RecommendationListResponse(BaseModel):
    analysis_id: int
    recommendations: list[RecommendationResponse]


class RecommendationDetailResponse(BaseModel):
    id: int
    analysis_id: int
    recipe_key: str
    recipe_name: str
    score: int
    reason: str
    warnings: list[str]
    detected_leftovers: list[str]
    safety_level: str
    safety_notes: list[str]
    recipe: RecipeResponse | None = None

    model_config = {"from_attributes": True}


class CookingSessionCreateRequest(BaseModel):
    user_id: int | None = None


class CookingSessionStopRequest(BaseModel):
    problem_note: str | None = None
    current_step: int = 0


class CookingSessionFinishRequest(BaseModel):
    current_step: int = 0


class CookingSessionProgressRequest(BaseModel):
    current_step: int = 0


class CookingSessionResponse(BaseModel):
    id: int
    recommendation_id: int
    user_id: int | None
    status: str
    current_step: int
    problem_note: str | None
    started_at: datetime
    finished_at: datetime | None
    stopped_at: datetime | None

    model_config = {"from_attributes": True}


class CookingSessionHistoryResponse(CookingSessionResponse):
    recommendation_name: str
    recipe_key: str
    analysis_id: int
