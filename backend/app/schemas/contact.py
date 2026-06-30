from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ContactMessageCreate(BaseModel):
    user_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[str] = None
    language: str = "id"
    topic: str = "help"
    message: str


class ContactMessageResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[str] = None
    language: str
    topic: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
