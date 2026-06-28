from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes_analysis, routes_auth, routes_chat, routes_config, routes_dashboard, routes_feedback, routes_health, routes_pdf, routes_recipes
from app.core.config import settings
from app.database.db import Base, engine
from app.database.schema_guards import ensure_runtime_columns


Base.metadata.create_all(bind=engine)
ensure_runtime_columns()

app = FastAPI(
    title="FoodLoop AI API",
    description="Backend for leftover-food identification and Indonesian recipe matching.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(self), microphone=(), geolocation=()"
    return response


app.include_router(routes_health.router)
app.include_router(routes_auth.router)
app.include_router(routes_analysis.router)
app.include_router(routes_recipes.router)
app.include_router(routes_chat.router)
app.include_router(routes_feedback.router)
app.include_router(routes_dashboard.router)
app.include_router(routes_config.router)
app.include_router(routes_pdf.router)
