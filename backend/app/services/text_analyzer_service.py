from __future__ import annotations

import re

from app.core.config import settings
from app.services.label_normalizer import keyword_map, safety_keywords, title_from_label
from app.services.openai_service import analyze_leftover_text_with_openai, openai_is_configured


def analyze_text(text: str) -> tuple[list[dict], list[str]]:
    if settings.text_analyzer_mode == "openai" and openai_is_configured():
        try:
            return analyze_leftover_text_with_openai(text)
        except Exception as error:
            items, notes = _analyze_text_with_rules(text)
            notes.append(f"OpenAI text analysis failed, used local fallback: {error}")
            return items, notes

    return _analyze_text_with_rules(text)


def _analyze_text_with_rules(text: str) -> tuple[list[dict], list[str]]:

    lowered = text.lower()
    found: dict[str, dict] = {}

    for keyword, (label, display_name) in keyword_map.items():
        if re.search(rf"\b{re.escape(keyword)}\b", lowered):
            found[label] = {
                "label": label,
                "display_name": display_name,
                "confidence": 0.95,
                "source": "text",
                "is_safety_flag": False,
            }

    safety_notes = []
    for keyword, note in safety_keywords.items():
        if keyword in lowered:
            safety_notes.append(note)
            found[f"safety_{keyword.replace(' ', '_')}"] = {
                "label": "unsafe_spoilage_sign",
                "display_name": title_from_label("unsafe_spoilage_sign"),
                "confidence": 0.9,
                "source": "text",
                "is_safety_flag": True,
            }

    if not found:
        found["unknown_food_leftover"] = {
            "label": "unknown_food_leftover",
            "display_name": "Unknown food leftover",
            "confidence": 0.4,
            "source": "text",
            "is_safety_flag": False,
        }

    return list(found.values()), safety_notes
