# FoodLoop AI Roadmap

## Product Direction

FoodLoop AI helps users turn leftover food into safe, practical Indonesian meal ideas. The app should stay simple for non-technical users: login, describe or capture leftovers, receive safety-first meal suggestions, then track progress in dashboard/history.

## Architecture Snapshot

- Frontend: React, Vite, Tailwind, React Router, Recharts.
- Backend: FastAPI, SQLAlchemy, OpenAI service layer, PDF service.
- Database: SQLite for local MVP, PostgreSQL-ready through `DATABASE_URL`.
- AI: OpenAI for text analysis, vision analysis, and nutrition/food-safety response, with local fallback rules.
- Data source: custom `traditional_indonesian_foods.json`.
- Auth: backend demo auth plus MVP Google OAuth redirect flow.

## Completed

- React/Vite/Tailwind frontend scaffold.
- Website-style horizontal navigation.
- Login/register gate with age and reason fields.
- English/Indonesian language selector.
- User-friendly home page.
- Analyze page combining upload, live camera, and text assistant.
- Simplified chat intake:
  - General food condition.
  - Specific request: diet, allergy, portion, available cooking time.
- FastAPI backend scaffold.
- SQLite database running locally.
- PostgreSQL-ready configuration.
- SQLAlchemy models for users, analyses, detected leftovers, recipes, and recommendations.
- OpenAI service layer for text, vision, and advisor responses.
- Local fallback when OpenAI fails or is disabled.
- Starter Indonesian food JSON and seed command.
- Dashboard and history backend endpoints.
- Frontend dashboard/history wired to backend user data.
- Recommendation detail backend endpoint.
- PDF generation and download backend endpoints.
- Backend status banner in frontend.
- Google OAuth MVP routes added.
- Local backend startup fixed on port `8000`.

## Current Risks

- The OpenAI and Google keys that were pasted in chat should be rotated.
- Google OAuth is not active until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present in `backend/.env`.
- PostgreSQL is prepared but not yet switched on locally.
- The custom Indonesian food JSON is still tiny, so recommendations are limited.
- Auth is MVP-level, not production session/JWT auth yet.
- The UI works, but the result/detail flow still needs polish for a real user presentation.

## Phase 1: Local MVP Stabilization

Goal: make the app reliable on your laptop.

1. Rotate exposed OpenAI and Google credentials.
2. Update `backend/.env` with the new OpenAI key.
3. Add Google OAuth credentials to `backend/.env`.
4. Run backend:

```powershell
cd C:\Users\charl\OneDrive\Desktop\WasteRecycler\backend
python -m app.database.seed
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

5. Run frontend:

```powershell
cd C:\Users\charl\OneDrive\Desktop\WasteRecycler\frontend
npm.cmd run dev
```

6. Test these flows:
   - Register/login with email.
   - Chat text submission.
   - Photo upload.
   - Live camera capture.
   - Dashboard updates.
   - History updates.
   - Recipe recommendation detail.
   - PDF download.

## Phase 2: PostgreSQL Switch

Goal: move from prototype SQLite storage to a deployment-ready database.

1. Install or create a PostgreSQL database named `foodloop_ai`.
2. Set `DATABASE_URL` in `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/foodloop_ai
```

3. Run:

```powershell
cd C:\Users\charl\OneDrive\Desktop\WasteRecycler\backend
python -m app.database.seed
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

4. Verify dashboard/history still save data.
5. Add Alembic migrations before deployment.

## Phase 3: AI Quality

Goal: make the assistant actually useful and safe.

1. Confirm the OpenAI model names are valid for your account.
2. Test text analysis with Indonesian leftover descriptions.
3. Test image analysis with low-quality photos.
4. Improve fallback rules for:
   - Nasi.
   - Mie/pasta.
   - Santan dishes.
   - Meat/chicken/fish.
   - Sambal.
   - Takeaway food.
5. Keep the assistant response in friendly Indonesian by default.
6. Make the assistant ask only for missing critical safety info.

## Phase 4: Food Dataset

Goal: make the custom JSON strong enough to power real recommendations.

1. Expand `backend/app/data/traditional_indonesian_foods.json`.
2. Add categories:
   - Rice-based leftovers.
   - Vegetable leftovers.
   - Chicken/meat/fish leftovers.
   - Tofu/tempe leftovers.
   - Sambal/sauce leftovers.
   - Soup/broth leftovers.
3. For each recipe, include:
   - `id`
   - `name`
   - `region`
   - `leftover_matches`
   - `required_safety`
   - `ingredients`
   - `steps`
   - `difficulty`
   - `estimated_time`
   - `safety_notes`
4. Add seed tests so broken JSON does not crash the app.

## Phase 5: Frontend UX Polish

Goal: make the app feel more detailed, clear, and consumer-friendly.

1. Improve result screen after text/photo/camera input.
2. Add recipe result cards with:
   - Safety outcome.
   - Cooking time.
   - Portion estimate.
   - Main leftovers used.
   - Nutrition estimate.
   - PDF download button.
3. Improve dashboard:
   - Most common leftovers.
   - Meals created.
   - Safety outcomes.
   - Weekly/monthly trend.
   - Eat Me First reminders.
4. Improve history:
   - Search/filter.
   - Detail view.
   - Re-download PDF.
   - Repeat recipe.
5. Add empty/loading/error states everywhere.
6. Improve mobile layouts for small screens.

## Phase 6: Auth And Accounts

Goal: make accounts real enough for deployment.

1. Finish Google OAuth browser testing.
2. Add secure session or JWT auth.
3. Add logout that clears backend session/token.
4. Protect user-specific API routes.
5. Add user profile fields:
   - Age.
   - Usage reason.
   - Allergies.
   - Diet preference.
   - Language preference.
6. Add account deletion/export if needed.

## Phase 7: PDF Export

Goal: make PDFs useful enough to share/save.

1. Improve PDF layout.
2. Include:
   - Leftover input summary.
   - Safety decision.
   - Recipe steps.
   - Reheating rule.
   - Nutrition estimate.
   - Storage tips.
   - Timestamp.
3. Add frontend download buttons in:
   - Recommendation detail.
   - History row.
   - Dashboard recent activity.

## Phase 8: Deployment

Goal: deploy as a real web app.

1. Choose hosting:
   - Frontend: Vercel/Netlify.
   - Backend: Render/Railway/Fly.io.
   - Database: Supabase/Neon/Railway PostgreSQL.
2. Set production environment variables.
3. Configure CORS for the production frontend URL.
4. Add HTTPS Google OAuth redirect URI.
5. Add logging and error monitoring.
6. Add API rate limits.
7. Add basic backup plan for PostgreSQL.

## Phase 9: Mobile Web And PWA

Goal: make it feel good on Android and iOS browsers.

1. Add PWA manifest.
2. Add app icons.
3. Add install prompt support.
4. Test camera permissions on:
   - Android Chrome.
   - iOS Safari.
5. Optimize touch targets.
6. Reduce bundle size with route-based code splitting.
7. Add offline-friendly UI for saved history later.

## Step-By-Step Next Sprint

1. Rotate keys and update `backend/.env`.
2. Put Google OAuth client id/secret into `backend/.env`.
3. Test email login, Google login, chat, dashboard, and history.
4. Switch to PostgreSQL locally.
5. Add 20-30 Indonesian recipes into the JSON.
6. Polish the recommendation/detail/PDF screens.
7. Add production auth/session tokens.
8. Prepare deployment environment.

## Definition Of MVP Done

- User can register/login.
- User can submit leftovers by text.
- User can submit leftovers by photo/camera.
- OpenAI produces safe Indonesian meal suggestions.
- Results are stored in PostgreSQL.
- Dashboard and history show real user data.
- User can open recipe detail.
- User can download PDF.
- App works on mobile browser.
- App is deployed with HTTPS.
