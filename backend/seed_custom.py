from sqlalchemy.orm import Session
from app import database
from app.models.menu import Category, MenuGroup, MenuItem
from app.models.orders import Table

def seed_custom_menu():
    database.init_db()
    db = database.SessionLocal()
    try:
        # 1. Create Category: Fruit
        fruit_cat = db.query(Category).filter(Category.name == "Fruit").first()
        if not fruit_cat:
            fruit_cat = Category(name="Fruit", type="KOT", status="Active")
            db.add(fruit_cat)
            db.commit()
            db.refresh(fruit_cat)
            print(f"Created category: {fruit_cat.name}")

        # 2. Create Group: Apple
        apple_group = db.query(MenuGroup).filter(MenuGroup.name == "Apple").first()
        if not apple_group:
            apple_group = MenuGroup(name="Apple", category_id=fruit_cat.id, status="Active")
            db.add(apple_group)
            db.commit()
            db.refresh(apple_group)
            print(f"Created group: {apple_group.name}")

        # 3. Create Items: Apple Juice, Apple Pie
        items = [
            {"name": "Apple Juice", "price": 120, "image": "🧃"},
            {"name": "Apple Pie", "price": 250, "image": "🥧"},
            {"name": "Fresh Apple", "price": 80, "image": "🍎"}
        ]

        for item_data in items:
            item = db.query(MenuItem).filter(MenuItem.name == item_data["name"]).first()
            if not item:
                item = MenuItem(
                    name=item_data["name"],
                    price=item_data["price"],
                    category_id=fruit_cat.id,
                    group_id=apple_group.id,
                    image=item_data["image"],
                    kot_bot="KOT",
                    status="Active"
                )
                db.add(item)
                print(f"Created item: {item.name}")
        
        # 4. Create some tables if they don't exist
        floors = ["Ground Floor", "First Floor", "Rooftop"]
        for i, floor in enumerate(floors):
            for j in range(1, 6):
                table_id = f"T{i*5 + j}"
                table = db.query(Table).filter(Table.table_id == table_id).first()
                if not table:
                    table = Table(
                        table_id=table_id,
                        floor=floor,
                        status="Vacant",
                        is_hold_table="No"
                    )
                    db.add(table)
                    print(f"Created table: {table_id} on {floor}")

        db.commit()
        print("✅ Custom menu and tables seeded successfully!")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_custom_menu()
