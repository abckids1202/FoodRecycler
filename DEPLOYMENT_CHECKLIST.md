# FoodLoop AI GitHub and Deployment Checklist

## 1. Never Commit These

The `.gitignore` is set up to block:

- `.env` and `.env.*`
- `node_modules`
- `frontend/dist`
- local database files such as `*.db`
- uploads and generated PDFs
- Python caches and logs

Keep only example files such as:

- `backend/.env.example`
- `backend/.env.postgresql.example`
- `frontend/.env.example`

## 2. Before First GitHub Push

Run these from the project root:

```bash
git init
git status
```

Check that these do **not** appear in `git status`:

- `backend/.env`
- `frontend/node_modules`
- `backend/foodloop.db`
- `backend/app/uploads`
- `backend/app/generated_pdfs`

Then commit:

```bash
git add .
git commit -m "Initial FoodLoop AI project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 3. Vercel Frontend Setup

In Vercel:

- Import the GitHub repo.
- Set the project root/build settings to the frontend app:
  - Root directory: `frontend`
  - Build command: `npm run build`
  - Output directory: `dist`

Add this environment variable in Vercel:

```text
VITE_API_BASE_URL=https://YOUR_BACKEND_DOMAIN
```

Replace `YOUR_BACKEND_DOMAIN` with the deployed FastAPI backend URL.

## 4. Backend Hosting

The backend is FastAPI + database + uploads/PDFs. Recommended hosts:

- Render
- Railway
- Fly.io
- A VPS/container platform

Backend start command:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Backend environment variables:

```text
DATABASE_URL=
FRONTEND_URL=https://YOUR_VERCEL_DOMAIN
UPLOAD_DIR=app/uploads
FOOD_JSON_PATH=app/data/traditional_indonesian_foods.json
TEXT_ANALYZER_MODE=openai
LEFTOVER_IDENTIFIER_MODE=openai
RECIPE_RESPONSE_MODE=openai
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=
OPENAI_VISION_MODEL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://YOUR_BACKEND_DOMAIN/api/auth/google/callback
```

## 5. Google OAuth Production Setup

In Google Cloud Console, add:

Authorized JavaScript origins:

```text
https://YOUR_VERCEL_DOMAIN
```

Authorized redirect URI:

```text
https://YOUR_BACKEND_DOMAIN/api/auth/google/callback
```

Then set the same redirect URI in backend environment variables.

## 6. Rotate Exposed Keys

If an API key or OAuth secret was pasted into chat, screenshots, commits, or logs, rotate it before deploying.

Rotate:

- OpenAI API key
- Google OAuth client secret
- Any database passwords

## 7. Production Data Notes

For production:

- Use managed PostgreSQL.
- Do not use local SQLite on the server.
- Store uploads/PDFs in object storage later.
- Add real auth/session protection before real users.
