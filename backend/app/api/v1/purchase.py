"""
Purchase management routes
"""
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
import random
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Supplier, PurchaseBill, PurchaseReturn

router = APIRouter()


@router.get("/suppliers")
async def get_suppliers(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all suppliers"""
    suppliers = db.query(Supplier).all()
    return suppliers


@router.post("/suppliers")
async def create_supplier(
    supplier_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new supplier"""
    new_supplier = Supplier(**supplier_data)
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier


@router.get("/bills")
async def get_bills(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all purchase bills"""
    bills = db.query(PurchaseBill).all()
    return bills


@router.post("/bills")
async def create_bill(
    bill_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new purchase bill"""
    bill_data['bill_number'] = f"PO-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    new_bill = PurchaseBill(**bill_data)
    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)
    return new_bill


@router.get("/returns")
async def get_returns(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all purchase returns"""
    returns = db.query(PurchaseReturn).all()
    return returns


@router.post("/returns")
async def create_return(
    return_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new purchase return"""
    return_data['return_number'] = f"RET-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    new_return = PurchaseReturn(**return_data)
    db.add(new_return)
    db.commit()
    db.refresh(new_return)
    return new_return
