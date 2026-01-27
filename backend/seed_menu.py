import sys
from pathlib import Path

# Add the backend directory to sys.path to allow importing app modules
backend_dir = Path(__file__).parent.absolute()
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, init_db
from app.models.menu import Category, MenuGroup, MenuItem

def seed_menu():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        # Check if already seeded to avoid duplicates
        if db.query(Category).first():
            print("Menu already seeded. Skipping...")
            return

        print("Seeding menu categories, groups, and items...")
        
        # 1. Categories
        fruit_cat = Category(name="Fruit", type="KOT", status="Active")
        veg_cat = Category(name="Vegetable", type="KOT", status="Active")
        drinks_cat = Category(name="Drinks", type="BOT", status="Active")
        
        db.add_all([fruit_cat, veg_cat, drinks_cat])
        db.commit()
        db.refresh(fruit_cat)
        db.refresh(veg_cat)
        db.refresh(drinks_cat)
        
        # 2. Menu Groups
        apple_group = MenuGroup(name="Apple", category_id=fruit_cat.id, status="Active")
        orange_group = MenuGroup(name="Orange", category_id=fruit_cat.id, status="Active")
        potato_group = MenuGroup(name="Potato", category_id=veg_cat.id, status="Active")
        beer_group = MenuGroup(name="Beer", category_id=drinks_cat.id, status="Active")
        
        db.add_all([apple_group, orange_group, potato_group, beer_group])
        db.commit()
        db.refresh(apple_group)
        db.refresh(orange_group)
        db.refresh(potato_group)
        db.refresh(beer_group)
        
        # 3. Menu Items
        items = [
            # Apple items
            MenuItem(name="Apple Juice", category_id=fruit_cat.id, group_id=apple_group.id, price=150, kot_bot="KOT", status="Active"),
            MenuItem(name="Apple Pie", category_id=fruit_cat.id, group_id=apple_group.id, price=250, kot_bot="KOT", status="Active"),
            MenuItem(name="Sliced Apple", category_id=fruit_cat.id, group_id=apple_group.id, price=100, kot_bot="KOT", status="Active"),
            
            # Orange items
            MenuItem(name="Orange Juice", category_id=fruit_cat.id, group_id=orange_group.id, price=140, kot_bot="KOT", status="Active"),
            MenuItem(name="Orange Candy", category_id=fruit_cat.id, group_id=orange_group.id, price=50, kot_bot="KOT", status="Active"),
            
            # Potato items
            MenuItem(name="French Fries", category_id=veg_cat.id, group_id=potato_group.id, price=200, kot_bot="KOT", status="Active"),
            MenuItem(name="Mashed Potato", category_id=veg_cat.id, group_id=potato_group.id, price=180, kot_bot="KOT", status="Active"),
            
            # Beer items
            MenuItem(name="Tuborg", category_id=drinks_cat.id, group_id=beer_group.id, price=550, kot_bot="BOT", status="Active"),
            MenuItem(name="Carlsberg", category_id=drinks_cat.id, group_id=beer_group.id, price=600, kot_bot="BOT", status="Active"),
        ]
        
        db.add_all(items)
        db.commit()
        print("✅ Menu seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding menu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_menu()
