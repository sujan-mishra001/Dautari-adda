"""
Inventory management service
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.inventory import (
    Product, UnitOfMeasurement, InventoryTransaction,
    BillOfMaterials, BOMItem, BatchProduction
)


class InventoryService:
    """Service for inventory operations"""
    
    # Product operations
    @staticmethod
    def get_all_products(db: Session) -> List[Product]:
        """Get all products"""
        return db.query(Product).all()
    
    @staticmethod
    def create_product(db: Session, product_data: dict) -> Product:
        """Create a new product"""
        new_product = Product(**product_data)
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return new_product
    
    @staticmethod
    def update_product_stock(db: Session, product_id: int, quantity: float, transaction_type: str) -> Optional[Product]:
        """Update product stock based on transaction type"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
        
        if transaction_type == "Add":
            product.current_stock += quantity
        elif transaction_type == "Remove":
            product.current_stock -= quantity
        elif transaction_type == "Adjustment":
            product.current_stock += quantity  # quantity can be positive or negative
        
        db.commit()
        db.refresh(product)
        return product
    
    # Transaction operations
    @staticmethod
    def create_transaction(db: Session, transaction_data: dict) -> InventoryTransaction:
        """Create an inventory transaction"""
        new_transaction = InventoryTransaction(**transaction_data)
        db.add(new_transaction)
        
        # Update product stock if needed
        if transaction_data.get('transaction_type') in ['Add', 'Remove', 'Adjustment']:
            InventoryService.update_product_stock(
                db,
                transaction_data['product_id'],
                transaction_data.get('quantity', 0),
                transaction_data['transaction_type']
            )
        
        db.commit()
        db.refresh(new_transaction)
        return new_transaction
    
    # BOM operations
    @staticmethod
    def get_all_boms(db: Session) -> List[BillOfMaterials]:
        """Get all bills of materials"""
        return db.query(BillOfMaterials).all()
    
    @staticmethod
    def create_bom(db: Session, bom_data: dict) -> BillOfMaterials:
        """Create a new bill of materials"""
        new_bom = BillOfMaterials(**bom_data)
        db.add(new_bom)
        db.commit()
        db.refresh(new_bom)
        return new_bom
