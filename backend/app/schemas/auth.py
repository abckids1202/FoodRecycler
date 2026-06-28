from __future__ import annotations

from pydantic import BaseModel, Field


class DemoAuthRequest(BaseModel):
    name: str = Field(default="FoodLoop User", max_length=120)
    email: str
    provider: str = "email"
    phone: str | None = Field(default=None, max_length=40)
    phone_country_code: str | None = Field(default="+62", max_length=8)
    age: int | None = Field(default=None, ge=1, le=120)
    reason: str | None = None
    reminder_opt_in: bool = False
    reminder_channel: str = Field(default="none", max_length=40)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    provider: str
    phone: str | None
    phone_country_code: str | None = None
    phone_national_number: str | None = None
    phone_e164: str | None = None
    age: int | None
    reason: str | None
    reminder_opt_in: bool = False
    reminder_channel: str = "none"

    model_config = {"from_attributes": True}
