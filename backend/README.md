# FoodLoop AI Backend

FastAPI backend for leftover-food analysis, Indonesian recipe matching, history, and dashboard tracking.

## Local Setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m app.database.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Secrets and API credentials go in `.env`. See [SETUP_KEYS.md](./SETUP_KEYS.md).

## Database

Default:

```text
sqlite:///./foodloop.db
```

PostgreSQL:

```text
postgresql+psycopg://USER:PASSWORD@HOST:5432/DB_NAME
```

See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for local setup and port troubleshooting.

## MVP Notes

- Text analysis can use OpenAI with rules fallback.
- Image/live-camera analysis can use OpenAI vision with mock fallback.
- The recipe source is `app/data/traditional_indonesian_foods.json`.
- PDF export is available for recommendation details.
