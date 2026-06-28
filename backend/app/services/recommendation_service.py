from sqlalchemy.orm import Session

from app.database.models import Analysis, FoodRecipe, Recommendation


def recommend_for_analysis(db: Session, analysis: Analysis) -> list[Recommendation]:
    detected_labels = {item.label for item in analysis.items if not item.is_safety_flag}
    db.query(Recommendation).filter(Recommendation.analysis_id == analysis.id).delete()

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
    for item in recommendations:
        db.add(item)
    db.commit()

    for item in recommendations:
        db.refresh(item)
    return recommendations
