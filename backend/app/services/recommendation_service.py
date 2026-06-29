from typing import Optional

from sqlalchemy.orm import Session

from app.database.models import Analysis, FoodRecipe, Recommendation
from app.services.label_normalizer import keyword_map
from app.services.recipe_loader import seed_recipes_from_json


def recommend_for_analysis(db: Session, analysis: Analysis) -> list[Recommendation]:
    detected_labels = _normalized_analysis_labels(analysis)
    db.query(Recommendation).filter(Recommendation.analysis_id == analysis.id).delete()

    recipes = db.query(FoodRecipe).all()
    if not recipes:
        seed_recipes_from_json(db)
        recipes = db.query(FoodRecipe).all()

    recommendations = []

    for recipe in recipes:
        matches = set(recipe.leftover_matches or [])
        overlap = detected_labels.intersection(matches)
        if not overlap:
            continue

        base_score = int((len(overlap) / max(len(matches), 1)) * 100)
        safety_penalty = 45 if analysis.safety_level == "not_safe_for_edible_reuse" else 0
        review_penalty = 15 if analysis.safety_level == "needs_user_review" else 0
        score = max(base_score - safety_penalty - review_penalty, 0)

        warnings = list(recipe.safety_notes or [])
        warnings.extend(analysis.safety_notes or [])

        reason = (
            f"Matched {', '.join(sorted(overlap))} with {recipe.name}. "
            "Confirm freshness and storage before cooking."
        )
        if analysis.safety_level == "not_safe_for_edible_reuse":
            reason = f"{recipe.name} matched ingredients, but edible reuse is not recommended due to safety flags."

        recommendations.append(
            Recommendation(
                analysis_id=analysis.id,
                recipe_key=recipe.recipe_key,
                recipe_name=recipe.name,
                score=score,
                reason=reason,
                warnings=warnings,
            )
        )

    recommendations.sort(key=lambda item: item.score, reverse=True)
    recommendations = recommendations[:8]
    for item in recommendations:
        db.add(item)
    db.commit()

    for item in recommendations:
        db.refresh(item)
    return recommendations


def _normalized_analysis_labels(analysis: Analysis) -> set[str]:
    labels = set()
    for item in analysis.items:
        if item.is_safety_flag:
            continue
        labels.update(_labels_from_text(item.label))
        labels.update(_labels_from_text(item.display_name))

    if analysis.source_text:
        labels.update(_labels_from_text(analysis.source_text))

    labels.discard("unknown_food_leftover")
    return labels


def _labels_from_text(value: Optional[str]) -> set[str]:
    if not value:
        return set()

    text = value.strip().lower().replace("-", "_").replace(" ", "_")
    labels = {text}

    readable = value.strip().lower().replace("_", " ")
    for keyword, (label, _) in keyword_map.items():
        normalized_keyword = keyword.lower().replace("_", " ")
        if normalized_keyword in readable or normalized_keyword.replace(" ", "_") in text:
            labels.add(label)

    aliases = {
        "cooked rice": "cooked_rice",
        "leftover rice": "cooked_rice",
        "nasi putih": "cooked_rice",
        "nasi matang": "cooked_rice",
        "nasi sisa": "cooked_rice",
        "eggs": "egg",
        "ayam goreng": "chicken_leftover",
        "ayam sisa": "chicken_leftover",
        "sayur sisa": "vegetable_leftover",
        "leftover vegetables": "vegetable_leftover",
        "ketchup": "sambal",
        "saus": "sambal",
        "saus sambal": "sambal",
        "tempe sisa": "tempeh_leftover",
        "tahu sisa": "tofu_leftover",
        "roti sisa": "bread_leftover",
        "pisang matang": "banana_overripe",
    }
    for alias, label in aliases.items():
        if alias in readable:
            labels.add(label)

    return labels
