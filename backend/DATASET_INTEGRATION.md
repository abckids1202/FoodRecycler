# Nusantara Leftover Recipe Dataset Integration

The project now uses `backend/app/data/traditional_indonesian_foods.json` as the main recipe dataset.

## Current Dataset

- Recipe count: 98
- Taxonomy labels: 19
- Safety guideline groups: 7
- Main purpose: Indonesian/Nusantara leftover matching with food-safety notes.

## Loader Behavior

The raw dataset has richer fields than the current database model. `app/services/recipe_loader.py` normalizes it during seeding:

- Ingredient objects become readable strings.
- Optional ingredients are appended with `optional:`.
- Equipment is appended as a `tools:` entry.
- Estimated servings are appended as an ingredient/detail line.
- Storage notes, nutrition tags, dietary tags, and source notes are appended to `safety_notes`.
- Legacy labels are added for older detections where useful.

## Seed Command

Run from `backend`:

```powershell
python -m app.database.seed
```

Expected output:

```text
Seeded 98 Indonesian food recipes.
```

## Important

The current database model stores only the MVP fields:

- recipe key
- name
- region
- leftover matches
- required safety
- ingredients
- steps
- difficulty
- estimated time
- safety notes

Future improvement: add richer recipe columns or a `recipe_metadata` JSON field for sources, province, servings, nutrition tags, dietary tags, equipment, and storage notes.
