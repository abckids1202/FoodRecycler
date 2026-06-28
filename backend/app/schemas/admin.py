from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class AdminMetric(BaseModel):
    label: str
    value: int | float | str


class AdminRecentUser(BaseModel):
    id: int
    name: str
    email: str
    provider: str
    reminder_channel: str
    created_at: datetime


class AdminSummary(BaseModel):
    totals: list[AdminMetric]
    recent_users: list[AdminRecentUser]
    reminder_reactivation_rate: float
    privacy_note: str
