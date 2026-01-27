from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models import MenuItem, Category, MenuGroup

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def clear_dummy_data():
    db = SessionLocal()
    try:
        print("Clearing MenuItem table...")
        db.query(MenuItem).delete()
        print("Clearing MenuGroup table...")
        db.query(MenuGroup).delete()
        print("Clearing Category table...")
        db.query(Category).delete()
        
        db.commit()
        print("Dummy data cleared successfully!")
    except Exception as e:
        print(f"Error clearing data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_dummy_data()
