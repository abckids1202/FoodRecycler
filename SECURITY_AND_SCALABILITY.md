# FoodLoop AI Security and Scalability Roadmap

## Current Protection

- Google OAuth is used as identity verification. Google never shares the user's Gmail password.
- User profile data is stored in the application database.
- OpenAI and Google credentials must stay in backend `.env` only.
- Backend responses include basic hardening headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` limiting camera/microphone/geolocation.
- CORS is limited to the configured frontend URL for local development.

## Must Do Before Production

1. Replace demo email auth with real authentication.
   - Hash passwords with `bcrypt` or `argon2`.
   - Add login verification instead of upserting any email.
   - Add JWT or secure HTTP-only session cookies.

2. Add authorization checks.
   - Every analysis, recipe session, PDF, dashboard, and history request should verify the current user.
   - Users must not be able to fetch another user's data by changing an ID in the URL.

3. Protect secrets.
   - Rotate any API keys that were pasted during development.
   - Store production secrets in the deployment provider's secret manager.
   - Never commit `.env`, database dumps, uploads, or generated PDFs.

4. Validate and limit uploads.
   - Enforce image MIME type and max file size.
   - Store uploads in object storage for production.
   - Add malware scanning if uploads become public or shared.

5. Add rate limiting.
   - Limit login attempts.
   - Limit OpenAI calls per user/day.
   - Limit upload frequency.
   - Limit feedback submission frequency.

6. Add notification consent.
   - Email and WhatsApp reminders must be opt-in.
   - Store reminder frequency and last-sent time.
   - Stop after a small number of reminders unless the user re-engages.

7. Add database migrations.
   - Replace runtime schema guards with Alembic migrations before deployment.
   - Keep migrations versioned and reviewed.

## Scalability Plan

1. Frontend
   - Deploy to Vercel, Netlify, or Cloudflare Pages.
   - Add code splitting to reduce the large JavaScript bundle.
   - Add PWA manifest for Android/iOS installability.

2. Backend
   - Deploy FastAPI to Render, Railway, Fly.io, or a container platform.
   - Use workers for slow jobs such as PDF generation, OpenAI analysis, and reminders.
   - Add structured logs and request IDs.

3. Database
   - Use managed PostgreSQL such as Supabase, Neon, Railway, or Render.
   - Add indexes for `user_id`, `created_at`, `analysis_id`, and session status.
   - Add backup and restore policy.

4. AI Pipeline
   - Require structured JSON output from OpenAI where possible.
   - Add fallback local rules when OpenAI is unavailable.
   - Cache repeated recipe matches.

5. Notifications
   - Email: SendGrid, Resend, Mailgun, or SMTP.
   - WhatsApp: WhatsApp Cloud API or Twilio.
   - Scheduler: APScheduler for MVP, Celery/RQ/Cloud scheduler for production.

## Google Auth Notes

Google OAuth can provide verified email, name, and profile information. It cannot and should not provide the Gmail password. For Google users, FoodLoop collects missing required fields, such as phone number, after Google redirects back to the app.
