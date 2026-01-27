"""
Complete database reset script - drops all tables and recreates them
WARNING: This will delete ALL data!
"""
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import init_db, get_db, get_engine, Base
from app.models import *  # Import all models


def drop_all_tables():
    """Drop all tables in the database using CASCADE"""
    engine = get_engine()
    
    print("\n🗑️  Dropping all tables...")
    
    try:
        # Use raw SQL with CASCADE to handle circular dependencies
        with engine.connect() as conn:
            # Drop all tables in public schema with CASCADE
            conn.execute(text("""
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                END $$;
            """))
            conn.commit()
        
        print("✅ All tables dropped successfully")
        return True
    except Exception as e:
        print(f"❌ Error dropping tables: {e}")
        return False


def create_all_tables():
    """Create all tables"""
    print("\n📊 Creating all tables...")
    
    try:
        init_db()
        print("✅ All tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False


def verify_tables():
    """Verify that all tables were created"""
    engine = get_engine()
    
    print("\n🔍 Verifying tables...")
    
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        
        tables = [row[0] for row in result]
        
        print(f"\n✅ Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table}")
        
        return tables


def main():
    print("=" * 60)
    print("  DATABASE RESET SCRIPT")
    print("  WARNING: This will DELETE ALL DATA!")
    print("=" * 60)
    
    confirmation = input("\n❓ Are you sure you want to reset the database? (type 'yes' to confirm): ")
    
    if confirmation.lower() != 'yes':
        print("\n❌ Database reset cancelled")
        return
    
    # Drop all tables
    if not drop_all_tables():
        print("\n❌ Failed to drop tables")
        return
    
    # Create all tables
    if not create_all_tables():
        print("\n❌ Failed to create tables")
        return
    
    # Verify tables
    tables = verify_tables()
    
    print("\n" + "=" * 60)
    print("✅ DATABASE RESET COMPLETE!")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("   1. Your database is now empty with fresh schema")
    print("   2. Create your first account via signup")
    print("   3. Create your organization and branches")
    print("\n🎉 Ready to start fresh!")


if __name__ == "__main__":
    main()
