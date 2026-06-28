from __future__ import annotations

from sqlalchemy import inspect, text

from app.database.db import engine


def ensure_runtime_columns() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    with engine.begin() as connection:
        if "phone" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(40)"))
        if "phone_country_code" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN phone_country_code VARCHAR(8)"))
        if "phone_national_number" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN phone_national_number VARCHAR(40)"))
        if "phone_e164" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN phone_e164 VARCHAR(40)"))
        if "reminder_opt_in" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN reminder_opt_in BOOLEAN DEFAULT false"))
        if "reminder_channel" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN reminder_channel VARCHAR(40) DEFAULT 'none'"))
