# Where To Put API Keys And Credentials

Put secrets in:

```text
backend/.env
```

Do not put real secrets in frontend files.

## OpenAI

Paste your key here:

```text
OPENAI_API_KEY=your_openai_key_here
```

Then switch the modes:

```text
TEXT_ANALYZER_MODE=openai
LEFTOVER_IDENTIFIER_MODE=openai
RECIPE_RESPONSE_MODE=openai
```

Recommended behavior:

- `TEXT_ANALYZER_MODE=openai`: text submissions are parsed by OpenAI.
- `LEFTOVER_IDENTIFIER_MODE=openai`: photo/live camera uploads are identified by OpenAI vision.
- `RECIPE_RESPONSE_MODE=openai`: chat replies are written by OpenAI after database/JSON matching.

The backend still matches recipes against `app/data/traditional_indonesian_foods.json`; OpenAI should not invent recipes outside your approved data.

## PostgreSQL

Replace SQLite:

```text
DATABASE_URL=sqlite:///./foodloop.db
```

with:

```text
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/foodloop_ai
```

Create the database in PostgreSQL first, then run:

```powershell
python -m app.database.seed
```

## Google Auth

Add these after creating OAuth credentials in Google Cloud Console:

```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback
```

Current frontend Google login is still a demo button. Real OAuth callback handling is the next backend step.

## VS Code Import Warnings

If VS Code says FastAPI or SQLAlchemy is unresolved but CMD works, VS Code is using the wrong Python interpreter.

Use:

```text
Python: Select Interpreter
```

Select:

```text
C:\Users\charl\.pyenv\pyenv-win\versions\3.9.6\python.exe
```

This is also set in:

```text
backend/.vscode/settings.json
```

