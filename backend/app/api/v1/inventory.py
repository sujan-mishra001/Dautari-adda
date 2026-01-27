"""
Inventory management routes
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    Product, UnitOfMeasurement, InventoryTransaction,
    BillOfMaterials, BatchProduction
)

router = APIRouter()


@router.get("/products")
async def get_products(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all products"""
    products = db.query(Product).all()
    return products


@router.post("/products")
async def create_product(
    product_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new product"""
    new_product = Product(**product_data)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.get("/units")
async def get_units(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all units of measurement"""
    units = db.query(UnitOfMeasurement).all()
    return units


@router.post("/units")
async def create_unit(
    unit_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new unit of measurement"""
    new_unit = UnitOfMeasurement(**unit_data)
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)
    return new_unit


@router.get("/transactions")
async def get_transactions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all inventory transactions"""
    transactions = db.query(InventoryTransaction).all()
    return transactions


@router.post("/transactions")
async def create_transaction(
    transaction_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new inventory transaction"""
    transaction_data['created_by'] = current_user.id
    new_transaction = InventoryTransaction(**transaction_data)
    db.add(new_transaction)
    
    # Update product stock if it's an Add transaction
    if transaction_data.get('transaction_type') == 'Add':
        product = db.query(Product).filter(Product.id == transaction_data['product_id']).first()
        if product:
            product.current_stock += transaction_data.get('quantity', 0)
    
    db.commit()
    db.refresh(new_transaction)
    return new_transaction


@router.get("/adjustments")
async def get_adjustments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all inventory adjustments"""
    adjustments = db.query(InventoryTransaction).filter(
        InventoryTransaction.transaction_type == 'Adjustment'
    ).all()
    return adjustments


@router.post("/adjustments")
async def create_adjustment(
    adjustment_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new inventory adjustment"""
    adjustment_data['created_by'] = current_user.id
    adjustment_data['transaction_type'] = 'Adjustment'
    new_adjustment = InventoryTransaction(**adjustment_data)
    db.add(new_adjustment)
    
    # Update product stock
    product = db.query(Product).filter(Product.id == adjustment_data['product_id']).first()
    if product:
        product.current_stock += adjustment_data.get('quantity', 0)
    
    db.commit()
    db.refresh(new_adjustment)
    return new_adjustment


@router.get("/counts")
async def get_counts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all inventory counts"""
    counts = db.query(InventoryTransaction).filter(
        InventoryTransaction.transaction_type == 'Count'
    ).all()
    return counts


@router.post("/counts")
async def create_count(
    count_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new inventory count"""
    count_data['created_by'] = current_user.id
    count_data['transaction_type'] = 'Count'
    new_count = InventoryTransaction(**count_data)
    db.add(new_count)
    db.commit()
    db.refresh(new_count)
    return new_count


@router.get("/boms")
async def get_boms(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all bills of materials"""
    boms = db.query(BillOfMaterials).all()
    return boms


@router.post("/boms")
async def create_bom(
    bom_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new BOM"""
    new_bom = BillOfMaterials(**bom_data)
    db.add(new_bom)
    db.commit()
    db.refresh(new_bom)
    return new_bom


@router.get("/productions")
async def get_productions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all batch productions"""
    productions = db.query(BatchProduction).all()
    return productions


@router.post("/productions")
async def create_production(
    production_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new batch production"""
    import random
    from datetime import datetime
    production_data['production_number'] = f"PROD-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    new_production = BatchProduction(**production_data)
    db.add(new_production)
    db.commit()
    db.refresh(new_production)
    return new_production
