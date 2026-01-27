import sys
import os
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).parent.absolute()
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from app.config import settings
from app.database import Base
from app.models import *  # Import all models to ensure they are registered

def reset_db():
    engine = create_engine(settings.DATABASE_URL)
    
    print("Dropping all tables...")
    try:
        # Drop tables in reverse order of dependencies or just drop all if possible
        # For simplicity in dev, we can just drop everything
        Base.metadata.reflect(bind=engine)
        Base.metadata.drop_all(bind=engine)
        print("✅ All tables dropped")
    except Exception as e:
        print(f"⚠️ Error dropping tables: {e}")
        # If it fails due to dependencies, we might need a more brute force approach for Postgres
        if 'postgresql' in settings.DATABASE_URL:
            print("Attempting brute force drop for Postgres...")
            with engine.connect() as conn:
                conn.execute(text("DROP SCHEMA public CASCADE;"))
                conn.execute(text("CREATE SCHEMA public;"))
                conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
            print("✅ Postgres schema reset")

    print("Recreating all tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables recreated")

if __name__ == "__main__":
    confirm = input("This will DELETE ALL DATA. Are you sure? (y/N): ")
    if confirm.lower() == 'y':
        reset_db()
    else:
        print("Operation cancelled.")
