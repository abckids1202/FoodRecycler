from app.database.db import Base, SessionLocal, engine
from app.services.recipe_loader import seed_recipes_from_json


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        count = seed_recipes_from_json(db)
        print(f"Seeded {count} Indonesian food recipes.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
