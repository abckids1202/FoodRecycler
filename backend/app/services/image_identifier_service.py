from __future__ import annotations

from pathlib import Path

from app.core.config import settings
from app.services.openai_service import analyze_leftover_image_with_openai, openai_is_configured


def identify_leftovers_from_image(image_path: str) -> tuple[list[dict], list[str]]:
    if settings.leftover_identifier_mode == "openai" and openai_is_configured():
        try:
            return analyze_leftover_image_with_openai(image_path)
        except Exception as error:
            items, notes = _identify_leftovers_with_mock(image_path)
            notes.append(f"OpenAI image analysis failed, used local fallback: {error}")
            return items, notes

    return _identify_leftovers_with_mock(image_path)


def _identify_leftovers_with_mock(image_path: str) -> tuple[list[dict], list[str]]:

    # MVP mock: replace with YOLO/vision model later while keeping this return shape.
    name = Path(image_path).name.lower()
    if "rice" in name or "nasi" in name:
        items = [
            ("cooked_rice", "Cooked rice", 0.78),
            ("egg", "Egg", 0.64),
        ]
    else:
        items = [
            ("cooked_rice", "Cooked rice", 0.72),
            ("vegetable_leftover", "Vegetable leftover", 0.61),
        ]

    return [
        {
            "label": label,
            "display_name": display_name,
            "confidence": confidence,
            "source": "image_mock",
            "is_safety_flag": False,
        }
        for label, display_name, confidence in items
    ], ["Image quality may be low. Ask the user to confirm detected leftovers."]
