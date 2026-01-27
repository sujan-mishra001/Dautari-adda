"""
Inventory-related models (Products, Units, Transactions, BOM, Production)
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class UnitOfMeasurement(Base):
    """Unit of measurement model"""
    __tablename__ = "units_of_measurement"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    abbreviation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Product(Base):
    """Product/Inventory item model"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    unit_id = Column(Integer, ForeignKey("units_of_measurement.id"))
    current_stock = Column(Float, default=0)
    min_stock = Column(Float, default=0)
    status = Column(String, default="In Stock")  # In Stock, Low Stock, Out of Stock
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    unit = relationship("UnitOfMeasurement")


class InventoryTransaction(Base):
    """Inventory transaction model"""
    __tablename__ = "inventory_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    transaction_type = Column(String, nullable=False)  # Add, Remove, Adjustment, Production, Count
    quantity = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product")
    user = relationship("User")


class BillOfMaterials(Base):
    """Bill of Materials model"""
    __tablename__ = "bills_of_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    menu_item = relationship("MenuItem")


class BOMItem(Base):
    """BOM item model"""
    __tablename__ = "bom_items"
    
    id = Column(Integer, primary_key=True, index=True)
    bom_id = Column(Integer, ForeignKey("bills_of_materials.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float, nullable=False)
    
    bom = relationship("BillOfMaterials")
    product = relationship("Product")


class BatchProduction(Base):
    """Batch production model"""
    __tablename__ = "batch_productions"
    
    id = Column(Integer, primary_key=True, index=True)
    production_number = Column(String, unique=True, nullable=False)
    bom_id = Column(Integer, ForeignKey("bills_of_materials.id"))
    quantity = Column(Float, nullable=False)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bom = relationship("BillOfMaterials")
