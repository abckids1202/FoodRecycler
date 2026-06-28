# FoodLoop AI Project Progress

## Current Status

The project is in MVP integration stage. The frontend and backend can run locally, talk to each other, save analysis data, show history/dashboard data, and prepare recipe/PDF outputs.

## Done

- Frontend React/Vite/Tailwind scaffold.
- Horizontal website-style navigation.
- Login/register gate connected to backend demo auth.
- English/Indonesian language selector.
- Home page with richer consumer-style sections.
- Analyze page with photo upload, live camera, and text assistant entry.
- AI Assistant page with simplified input:
  - Kondisi umum
  - Cari spesifik: diet, alergi, porsi, waktu
- Backend FastAPI scaffold.
- SQLite database by default.
- PostgreSQL-ready `DATABASE_URL`.
- OpenAI-ready text, vision, and response services.
- Local rules fallback when OpenAI fails or is disabled.
- Indonesian food JSON seed file.
- History/dashboard backend endpoints.
- Frontend history/dashboard pages wired to backend user data.
- Backend status banner in frontend.
- Recommendation detail route and PDF export route.
- Google OAuth MVP redirect flow.
- `POSTGRESQL_SETUP.md` added for local PostgreSQL switching.

## In Progress

- Real OpenAI testing with your selected model.
- PostgreSQL local database switch.
- Google OAuth browser testing.
- Recipe result UX polish after a user submits text/photo/live camera.

## Not Started

- Hosted PostgreSQL setup.
- Alembic migration system.
- Production-grade auth/session tokens.
- Full traditional Indonesian foods JSON.
- Deployment pipeline.
- Mobile web/PWA polish for Android and iOS.
- Optional native app wrapper later.

## Next Recommended Steps

1. Rotate exposed API keys and update `backend/.env`.
2. Add Google OAuth values to `backend/.env` and test login.
3. Test OpenAI text mode with one valid model.
4. Switch `DATABASE_URL` to PostgreSQL and seed the recipe data.
5. Polish recipe results, dashboard, history, and PDF download UX.
6. Expand the Indonesian food JSON.
7. Add production auth/session tokens.
8. Prepare deployment and mobile PWA polish.
