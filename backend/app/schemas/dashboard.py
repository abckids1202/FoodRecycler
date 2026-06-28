from __future__ import annotations

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_analyses: int
    total_food_ideas: int
    top_leftover: str | None
    saved_recipe_count: int
    recipes_started: int = 0
    recipes_finished: int = 0
    recipes_stopped: int = 0
    completion_rate: float = 0.0
    most_completed_recipe: str | None = None
    most_stopped_recipe: str | None = None
    reminder_reactivation_rate: float = 0.0


class FrequencyItem(BaseModel):
    name: str
    count: int
