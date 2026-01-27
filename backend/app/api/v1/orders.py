"""
Order management routes
"""
from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
import random
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Order, OrderItem, KOT, KOTItem, Table
from app.schemas import OrderResponse

router = APIRouter()


@router.get("", response_model=List[OrderResponse])
async def get_orders(
    order_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all orders, optionally filtered by order_type and status"""
    query = db.query(Order).options(
        joinedload(Order.table),
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.menu_item),
        joinedload(Order.kots).joinedload(KOT.items).joinedload(KOTItem.menu_item)
    )
    
    if order_type:
        query = query.filter(Order.order_type == order_type)
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get order by ID with items"""
    order = db.query(Order).options(
        joinedload(Order.table),
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.menu_item),
        joinedload(Order.kots).joinedload(KOT.items).joinedload(KOTItem.menu_item)
    ).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order


@router.post("", response_model=OrderResponse)
async def create_order(
    order_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new order"""
    items_data = order_data.pop('items', [])
    
    if 'order_number' not in order_data:
        order_data['order_number'] = f"ORD-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    order_data['created_by'] = current_user.id
    
    # Calculate amounts if not provided
    if 'gross_amount' not in order_data:
        order_data['gross_amount'] = order_data.get('total_amount', 0)
    if 'net_amount' not in order_data:
        discount = order_data.get('discount', 0)
        order_data['net_amount'] = order_data['gross_amount'] - discount
    
    new_order = Order(**order_data)
    db.add(new_order)
    db.flush() # Get ID before adding items
    
    # Add items
    for item in items_data:
        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=item['menu_item_id'],
            quantity=item['quantity'],
            price=item.get('price', 0),
            subtotal=item.get('subtotal', item.get('price', 0) * item['quantity']),
            notes=item.get('notes', '')
        )
        db.add(order_item)
    
    # Update table status to Occupied if table order
    if new_order.table_id:
        table = db.query(Table).filter(Table.id == new_order.table_id).first()
        if table:
            table.status = "Occupied"
    
    db.commit()
    db.refresh(new_order)
    
    # Reload with relationships
    order = db.query(Order).options(
        joinedload(Order.table),
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.menu_item),
        joinedload(Order.kots).joinedload(KOT.items).joinedload(KOTItem.menu_item)
    ).filter(Order.id == new_order.id).first()
    
    return order


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update an order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    old_status = order.status
    
    for key, value in order_data.items():
        setattr(order, key, value)
    
    # Recalculate net amount if gross or discount changed
    if 'gross_amount' in order_data or 'discount' in order_data:
        order.net_amount = order.gross_amount - order.discount
    
    # Update table status based on order status
    if 'status' in order_data and order.table_id:
        table = db.query(Table).filter(Table.id == order.table_id).first()
        if table:
            new_status = order_data['status']
            if new_status in ['Paid', 'Completed']:
                # Reset table to Available when order is paid/completed
                table.status = "Available"
            elif new_status == 'Cancelled':
                # Reset table to Available when order is cancelled
                table.status = "Available"
            elif new_status == 'BillRequested':
                # Set table to BillRequested
                table.status = "BillRequested"
            elif new_status in ['Pending', 'In Progress']:
                # Keep table occupied
                table.status = "Occupied"
    
    db.commit()
    
    # Reload with relationships
    updated_order = db.query(Order).options(
        joinedload(Order.table),
        joinedload(Order.customer)
    ).filter(Order.id == order_id).first()
    
    return updated_order


@router.delete("/{order_id}")
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete an order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Reset table status if this was a table order
    if order.table_id:
        table = db.query(Table).filter(Table.id == order.table_id).first()
        if table:
            table.status = "Available"
    
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}
