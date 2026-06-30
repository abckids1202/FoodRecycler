from typing import Optional

from sqlalchemy.orm import Session

from app.database.models import Analysis, FoodRecipe, Recommendation
from app.services.label_normalizer import keyword_map
from app.services.recipe_loader import load_food_json, seed_recipes_from_json


def recommend_for_analysis(db: Session, analysis: Analysis) -> list[Recommendation]:
    detected_labels = _normalized_analysis_labels(analysis)
    db.query(Recommendation).filter(Recommendation.analysis_id == analysis.id).delete()

    recipes = db.query(FoodRecipe).all()
    json_recipe_count = len(load_food_json())
    if len(recipes) < json_recipe_count:
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

    if not recommendations and detected_labels and analysis.safety_level != "not_safe_for_edible_reuse":
        recommendations = _fallback_recommendations(db, analysis, recipes, detected_labels)

    recommendations.sort(key=lambda item: item.score, reverse=True)
    recommendations = recommendations[:8]
    for item in recommendations:
        db.add(item)
    db.commit()

    for item in recommendations:
        db.refresh(item)
    return recommendations


def _fallback_recommendations(db: Session, analysis: Analysis, recipes: list[FoodRecipe], detected_labels: set[str]) -> list[Recommendation]:
    priority = [
        "nasi_goreng_kampung",
        "nasi_goreng_jawa",
        "omelet_sayur",
        "orak_arik_telur_sayur",
        "perkedel_nasi",
        "roti_pisang_panggang",
    ]
    label_groups = {
        "cooked_rice": {"nasi_goreng_kampung", "nasi_goreng_jawa", "perkedel_nasi"},
        "egg": {"omelet_sayur", "orak_arik_telur_sayur", "nasi_goreng_kampung"},
        "vegetable_leftover": {"omelet_sayur", "orak_arik_telur_sayur", "nasi_goreng_kampung"},
        "banana_overripe": {"roti_pisang_panggang"},
        "bread_leftover": {"roti_pisang_panggang"},
    }
    allowed_keys = set()
    for label in detected_labels:
        allowed_keys.update(label_groups.get(label, set()))
    if not allowed_keys:
        allowed_keys.update(priority[:3])

    recipe_by_key = {recipe.recipe_key: recipe for recipe in recipes}
    results = []
    for key in priority:
        if key not in allowed_keys or key not in recipe_by_key:
            continue
        recipe = recipe_by_key[key]
        results.append(
            Recommendation(
                analysis_id=analysis.id,
                recipe_key=recipe.recipe_key,
                recipe_name=recipe.name,
                score=45,
                reason=f"{recipe.name} is a practical fallback suggestion. Confirm ingredients and storage before cooking.",
                warnings=list(recipe.safety_notes or []) + list(analysis.safety_notes or []),
            )
        )
    return results


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
        "white rice": "cooked_rice",
        "rice leftover": "cooked_rice",
        "nasi putih": "cooked_rice",
        "nasi matang": "cooked_rice",
        "nasi sisa": "cooked_rice",
        "eggs": "egg",
        "telor": "egg",
        "telur ayam": "egg",
        "ayam goreng": "chicken_leftover",
        "ayam sisa": "chicken_leftover",
        "fried chicken": "chicken_leftover",
        "leftover chicken": "chicken_leftover",
        "sayur sisa": "vegetable_leftover",
        "sayuran": "vegetable_leftover",
        "sayur matang": "vegetable_leftover",
        "leftover vegetables": "vegetable_leftover",
        "cooked vegetables": "vegetable_leftover",
        "ketchup": "sambal",
        "kecap": "sambal",
        "kecap manis": "sambal",
        "saus": "sambal",
        "saus sambal": "sambal",
        "tempe sisa": "tempeh_leftover",
        "tempe goreng": "tempeh_leftover",
        "leftover tempeh": "tempeh_leftover",
        "tahu sisa": "tofu_leftover",
        "tahu goreng": "tofu_leftover",
        "leftover tofu": "tofu_leftover",
        "roti sisa": "bread_leftover",
        "roti tawar": "bread_leftover",
        "pisang matang": "banana_overripe",
        "pisang kematangan": "banana_overripe",
    }
    for alias, label in aliases.items():
        if alias in readable:
            labels.add(label)

    return labels
