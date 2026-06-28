import json
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.models import FoodRecipe


def load_food_json() -> list[dict]:
    with settings.food_json_file.open("r", encoding="utf-8") as input_file:
        payload = json.load(input_file)
    return payload.get("recipes", [])


def seed_recipes_from_json(db: Session) -> int:
    recipes = load_food_json()
    count = 0
    for recipe in recipes:
        existing = db.query(FoodRecipe).filter(FoodRecipe.recipe_key == recipe["id"]).first()
        normalized = normalize_recipe(recipe)
        values = {
            "recipe_key": normalized["recipe_key"],
            "name": normalized["name"],
            "region": normalized["region"],
            "leftover_matches": normalized["leftover_matches"],
            "required_safety": normalized["required_safety"],
            "ingredients": normalized["ingredients"],
            "steps": normalized["steps"],
            "difficulty": normalized["difficulty"],
            "estimated_time": normalized["estimated_time"],
            "safety_notes": normalized["safety_notes"],
        }
        if existing:
            for key, value in values.items():
                setattr(existing, key, value)
        else:
            db.add(FoodRecipe(**values))
        count += 1
    db.commit()
    return count


def normalize_recipe(recipe: dict[str, Any]) -> dict[str, Any]:
    ingredients = [_format_ingredient(item) for item in recipe.get("ingredients", [])]
    optional = recipe.get("optional_ingredients", [])
    if optional:
        ingredients.extend([f"optional: {item}" for item in optional])

    equipment = recipe.get("equipment", [])
    if equipment:
        ingredients.append("tools: " + ", ".join(equipment))

    servings = recipe.get("estimated_servings")
    if servings:
        ingredients.append(f"estimated servings: {servings}")

    safety_notes = list(recipe.get("safety_notes", []))
    storage_notes = recipe.get("storage_notes", [])
    if storage_notes:
        safety_notes.extend([f"Storage: {item}" for item in storage_notes])

    nutrition_tags = recipe.get("nutrition_tags", [])
    dietary_tags = recipe.get("dietary_tags", [])
    if nutrition_tags:
        safety_notes.append("Nutrition tags: " + ", ".join(nutrition_tags))
    if dietary_tags:
        safety_notes.append("Dietary tags: " + ", ".join(dietary_tags))

    source_notes = recipe.get("source_notes")
    if source_notes:
        safety_notes.append(f"Source note: {source_notes}")

    return {
        "recipe_key": recipe["id"],
        "name": recipe["name"],
        "region": recipe.get("province_or_area") or recipe.get("region", "Indonesia"),
        "leftover_matches": _with_legacy_labels(recipe.get("leftover_matches", [])),
        "required_safety": recipe.get("required_safety", []),
        "ingredients": ingredients,
        "steps": recipe.get("steps", []),
        "difficulty": recipe.get("difficulty", "easy"),
        "estimated_time": recipe.get("estimated_time", "15-30 minutes"),
        "safety_notes": safety_notes,
    }


def _format_ingredient(item: Any) -> str:
    if isinstance(item, str):
        return item
    if not isinstance(item, dict):
        return str(item)

    name = item.get("name_id") or item.get("name") or "ingredient"
    amount = item.get("amount")
    required = "required" if item.get("required") else "optional"
    leftover = "leftover" if item.get("leftover_item") else "additional"
    parts = [str(name)]
    if amount:
        parts.append(f"({amount})")
    parts.append(f"- {required}, {leftover}")
    return " ".join(parts)


def _with_legacy_labels(labels: list[str]) -> list[str]:
    aliases = {
        "tofu_leftover": ["tofu"],
        "tempeh_leftover": ["tempeh"],
        "noodles_leftover": ["cooked_noodle"],
        "bread_leftover": ["stale_bread"],
    }
    expanded = list(labels)
    for label in labels:
        expanded.extend(aliases.get(label, []))
    return sorted(set(expanded))
