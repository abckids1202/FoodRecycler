from __future__ import annotations

from sqlalchemy import inspect, text

from app.database.db import engine


def ensure_runtime_columns() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "phone" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(40)"))
