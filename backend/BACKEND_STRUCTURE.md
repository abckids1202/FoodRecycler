# Backend Code Structure

```text
backend/
  app/
    main.py
    api/
      routes_auth.py
      routes_analysis.py
      routes_recipes.py
      routes_dashboard.py
      routes_health.py
    core/
      config.py
      storage.py
    database/
      db.py
      models.py
      seed.py
    data/
      traditional_indonesian_foods.json
    schemas/
      auth.py
      analysis.py
      recipe.py
      dashboard.py
    services/
      image_identifier_service.py
      label_normalizer.py
      recommendation_service.py
      recipe_loader.py
      safety_service.py
      text_analyzer_service.py
  .env.example
  requirements.txt
  README.md
```

## Data Flow

### Text Input

1. Frontend sends text and condition to `POST /api/analysis/text`.
2. `text_analyzer_service.py` extracts leftover labels.
3. `safety_service.py` evaluates condition and unsafe words.
4. Analysis and detected leftovers are stored in the database.
5. `recommendation_service.py` matches labels against `FoodRecipe` rows seeded from JSON.
6. Frontend can fetch recommendations from `GET /api/recipes/recommend/{analysis_id}`.

### Photo / Live Camera Input

1. Frontend sends image and condition to `POST /api/analysis/upload`.
2. `storage.py` validates and saves JPG, PNG, or WEBP.
3. `image_identifier_service.py` returns mock leftover labels for MVP.
4. The same safety, storage, and recommendation flow runs.

### Recipe Source

The initial source is:

```text
app/data/traditional_indonesian_foods.json
```

Run this after editing the JSON:

```powershell
python -m app.database.seed
```

## Replaceable Pieces

- Replace `text_analyzer_service.py` with an API/LLM parser later.
- Replace `image_identifier_service.py` with a vision model or hosted image API later.
- Keep routes and response shapes stable so frontend work does not churn.
