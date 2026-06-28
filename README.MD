# FoodLoop AI

Turn food waste into usable recipes with AI.

FoodLoop AI is an AI-powered food-waste recipe platform. Users upload or capture a food waste image, the backend detects visible waste materials, recommends safe transformation options, and generates a downloadable PDF recipe.

## Current Status

This repo is being built phase by phase. The frontend app shell is the first implementation target, followed by FastAPI backend services.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Planned Stack

Frontend:

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

Backend:

- FastAPI
- SQLAlchemy
- Alembic
- SQLite locally
- PostgreSQL-ready configuration
- ReportLab for PDF generation

AI:

- Mock detector for MVP
- YOLO detector later
- Database-controlled recipe rules
- Optional structured LLM recipe generator later
