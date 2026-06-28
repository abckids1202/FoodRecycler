from __future__ import annotations

from pydantic import BaseModel, Field


class DemoAuthRequest(BaseModel):
    name: str = Field(default="FoodLoop User", max_length=120)
    email: str
    provider: str = "email"
    phone: str | None = Field(default=None, max_length=40)
    age: int | None = Field(default=None, ge=1, le=120)
    reason: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    provider: str
    phone: str | None
    age: int | None
    reason: str | None

    model_config = {"from_attributes": True}
