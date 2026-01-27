"""
Database migration script - adds multi-tenant tables and migrates existing data
Run this to upgrade your database to support the multi-tenant SaaS architecture
"""
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import init_db, get_db
from app.models import (
    User, Organization, Branch, UserBranchAssignment
)
from app.models.organization import SubscriptionPlan, SubscriptionStatus
from datetime import datetime


def migrate_to_multitenant(db: Session):
    """Migrate existing single-tenant data to multi-tenant structure"""
    
    print("\n🔄 Starting migration to multi-tenant architecture...")
    
    # Check if there are existing users without organization_id
    users_without_org = db.query(User).filter(User.organization_id == None).all()
    
    if not users_without_org:
        print("✅ All users already have organizations assigned")
        return
    
    print(f"📊 Found {len(users_without_org)} users without organization")
    
    # Find if there's already a default organization
    default_org = db.query(Organization).filter(Organization.slug == "dautari-adda-legacy").first()
    
    if not default_org:
        # Find the first admin user to be the owner
        admin_user = db.query(User).filter(User.role == "admin").first()
        
        if not admin_user:
            print("❌ No admin user found. Please create an admin user first.")
            return
        
        print(f"📌 Creating default organization with owner: {admin_user.full_name}")
        
        # Create default organization for existing data
        default_org = Organization(
            name="Dautari Adda (Legacy)",
            slug="dautari-adda-legacy",
            subscription_plan=SubscriptionPlan.LEGACY,
            subscription_status=SubscriptionStatus.ACTIVE,
            subscription_start_date=datetime.utcnow(),
            max_branches=999,  # Unlimited for legacy
            max_users=999,
            company_address="Kathmandu, Nepal",
            company_phone="",
            company_email="",
            owner_id=admin_user.id
        )
        
        db.add(default_org)
        db.commit()
        db.refresh(default_org)
        
        print(f"✅ Created organization: {default_org.name} (ID: {default_org.id})")
    
    # Create default branch
    default_branch = db.query(Branch).filter(
        Branch.organization_id == default_org.id
    ).first()
    
    if not default_branch:
        print("📌 Creating default branch...")
        
        default_branch = Branch(
            organization_id=default_org.id,
            name="Main Branch",
            code="MAIN-001",
            location="Main Location",
            address="Kathmandu, Nepal",
            is_active=True
        )
        
        db.add(default_branch)
        db.commit()
        db.refresh(default_branch)
        
        print(f"✅ Created branch: {default_branch.name} (ID: {default_branch.id})")
    
    # Assign all existing users to this organization and branch
    print("📌 Assigning users to organization and branch...")
    
    users_migrated = 0
    for user in users_without_org:
        # Link user to organization
        user.organization_id = default_org.id
        
        # Set owner flag for admin users
        if user.role == "admin" and user.id == default_org.owner_id:
            user.is_organization_owner = True
        
        # Set current branch
        user.current_branch_id = default_branch.id
        
        # Create branch assignment
        existing_assignment = db.query(UserBranchAssignment).filter(
            UserBranchAssignment.user_id == user.id,
            UserBranchAssignment.branch_id == default_branch.id
        ).first()
        
        if not existing_assignment:
            assignment = UserBranchAssignment(
                user_id=user.id,
                branch_id=default_branch.id,
                organization_id=default_org.id,
                is_primary=True  # Make this their primary branch
            )
            db.add(assignment)
        
        users_migrated += 1
    
    db.commit()
    
    print(f"✅ Migrated {users_migrated} users to organization '{default_org.name}'")
    print(f"✅ All users assigned to branch '{default_branch.name}'")
    print("\n🎉 Migration completed successfully!")


def seed_test_organizations(db: Session):
    """Seed additional test organizations for development"""
    
    print("\n🌱 Seeding test organizations...")
    
    # Check if test organizations already exist
    test_org = db.query(Organization).filter(Organization.slug == "test-restaurant").first()
    
    if test_org:
        print("✅ Test organizations already exist")
        return
    
    # Create a test admin user for the new organization
    test_admin = db.query(User).filter(User.email == "test@restaurant.com").first()
    
    if not test_admin:
        from app.dependencies import get_password_hash
        
        test_admin = User(
            username="testadmin",
            email="test@restaurant.com",
            full_name="Test Restaurant Admin",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            disabled=False
        )
        
        db.add(test_admin)
        db.commit()
        db.refresh(test_admin)
        
        print(f"✅ Created test admin: {test_admin.email}")
    
    # Create test organization
    test_org = Organization(
        name="Test Restaurant Group",
        slug="test-restaurant",
        subscription_plan=SubscriptionPlan.PREMIUM,
        subscription_status=SubscriptionStatus.ACTIVE,
        subscription_start_date=datetime.utcnow(),
        max_branches=10,
        max_users=100,
        company_address="Test Location",
        company_email="info@testrestaurant.com",
        owner_id=test_admin.id
    )
    
    db.add(test_org)
    db.commit()
    db.refresh(test_org)
    
    # Update test admin
    test_admin.organization_id = test_org.id
    test_admin.is_organization_owner = True
    db.commit()
    
    print(f"✅ Created organization: {test_org.name}")
    
    # Create test branches
    branches_data = [
        {"name": "Downtown Branch", "code": "TEST-DT-001", "location": "Downtown"},
        {"name": "Uptown Branch", "code": "TEST-UT-001", "location": "Uptown"},
        {"name": "Airport Branch", "code": "TEST-AP-001", "location": "Airport"}
    ]
    
    for branch_info in branches_data:
        branch = Branch(
            organization_id=test_org.id,
            name=branch_info["name"],
            code=branch_info["code"],
            location=branch_info["location"],
            is_active=True
        )
        
        db.add(branch)
        db.commit()
        db.refresh(branch)
        
        # Assign test admin to this branch
        assignment = UserBranchAssignment(
            user_id=test_admin.id,
            branch_id=branch.id,
            organization_id=test_org.id,
            is_primary=(branch_info["code"] == "TEST-DT-001")  # First branch is primary
        )
        
        db.add(assignment)
        
        print(f"✅ Created branch: {branch.name}")
        
        # Set current branch for test admin (first branch)
        if branch_info["code"] == "TEST-DT-001":
            test_admin.current_branch_id = branch.id
    
    db.commit()
    
    print("\n🎉 Test organizations seeded successfully!")
    print("\n📝 Test Credentials:")
    print("   Email: test@restaurant.com")
    print("   Password: admin123")
    print("   Organization: Test Restaurant Group")
    print("   Branches: 3 (Downtown, Uptown, Airport)")


def main():
    """Run the migration"""
    print("=" * 60)
    print("  Multi-Tenant Database Migration & Seed Script")
    print("=" * 60)
    
    # Initialize database (creates tables if they don't exist)
    init_db()
    
    # Get database session
    db = next(get_db())
    
    try:
        # Migrate existing data
        migrate_to_multitenant(db)
        
        # Seed test data (optional)
        seed_test = input("\n❓ Do you want to seed test organizations? (y/n): ").lower()
        if seed_test == 'y':
            seed_test_organizations(db)
        
        print("\n" + "=" * 60)
        print("✅ All done! Your database is now multi-tenant ready!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
