# PostgreSQL Setup

FoodLoop AI already supports PostgreSQL through `DATABASE_URL`.

## Local PostgreSQL

1. Install PostgreSQL.
2. Create a database named `foodloop_ai`.
3. Copy `backend/.env.postgresql.example` into `backend/.env`.
4. Replace `YOUR_PASSWORD` with your local PostgreSQL password.
5. Keep the OpenAI and Google values in `.env`.

Example connection string:

```text
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/foodloop_ai
```

If you see `password authentication failed for user "postgres"`, the app is reaching PostgreSQL but the password in `DATABASE_URL` is wrong for that local user.

## Create Database From psql

Open PostgreSQL `psql` as a user that can create databases, then run:

```sql
CREATE DATABASE foodloop_ai;
```

If you use a different PostgreSQL user, update both the username and password:

```text
DATABASE_URL=postgresql+psycopg://YOUR_USER:YOUR_PASSWORD@localhost:5432/foodloop_ai
```

## Verify Connection

Run from `backend`:

```powershell
python -c "from app.database.db import engine; print(engine.url.get_backend_name()); print(engine.connect().close() or 'connected')"
```

Expected backend name:

```text
postgresql
```

## Initialize Tables And Recipes

Run from `backend`:

```powershell
pip install -r requirements.txt
python -m app.database.seed
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

`app.main` creates tables on startup for the MVP. Later, add Alembic migrations before production deployment.

New MVP tables are created automatically on startup, including `recipe_cooking_sessions`.

## If Port 8000 Is Blocked

Check what owns port 8000:

```powershell
Get-NetTCPConnection -LocalPort 8000 | Select-Object LocalAddress,LocalPort,State,OwningProcess
```

Use a different backend port:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8010
```

Then set the frontend API URL:

```text
VITE_API_BASE_URL=http://127.0.0.1:8010
```
