"""
Reports and export routes
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Order
from app.utils.pdf_generator import generate_pdf_report, generate_invoice_pdf
from app.utils.excel_generator import generate_excel_report

router = APIRouter()


@router.get("/dashboard-summary")
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get summarized data for the admin dashboard - Last 24 Hours"""
    from app.models import Table, Order
    from datetime import timedelta
    
    total_tables = db.query(Table).count()
    occupied_tables = db.query(Table).filter(Table.status == 'Occupied').count()
    occupancy = (occupied_tables / total_tables * 100) if total_tables > 0 else 0
    
    # Last 24 hours instead of calendar day
    twenty_four_hours_ago = datetime.now() - timedelta(hours=24)
    orders_24h_list = db.query(Order).filter(Order.created_at >= twenty_four_hours_ago).all()
    
    # Sales breakdown
    sales_24h = sum(order.net_amount or 0 for order in orders_24h_list)
    paid_sales = sum(order.paid_amount or 0 for order in orders_24h_list)
    credit_sales = sum(order.credit_amount or 0 for order in orders_24h_list)
    discount = sum(order.discount or 0 for order in orders_24h_list)
    
    # Order type breakdown - Table and Dine-In are the same
    dine_in_count = len([o for o in orders_24h_list if o.order_type in ['Dine-In', 'Table']])
    takeaway_count = len([o for o in orders_24h_list if o.order_type == 'Takeaway'])
    delivery_count = len([o for o in orders_24h_list if o.order_type == 'Delivery'])

    # Outstanding revenue (all time credit)
    outstanding_revenue = sum(order.credit_amount or 0 for order in db.query(Order).all())

    # Top 3 items with outstanding revenue (from credit orders)
    from app.models import OrderItem, MenuItem
    from sqlalchemy import func
    
    # Get all order items from orders with credit
    credit_orders = db.query(Order).filter(Order.credit_amount > 0).all()
    credit_order_ids = [o.id for o in credit_orders]
    
    if credit_order_ids:
        # Aggregate by menu item
        top_items_query = db.query(
            MenuItem.name,
            func.sum(OrderItem.quantity * OrderItem.price).label('total_credit')
        ).join(
            OrderItem, MenuItem.id == OrderItem.menu_item_id
        ).filter(
            OrderItem.order_id.in_(credit_order_ids)
        ).group_by(
            MenuItem.id, MenuItem.name
        ).order_by(
            func.sum(OrderItem.quantity * OrderItem.price).desc()
        ).limit(3).all()
        
        top_outstanding_items = [
            {"name": item.name, "amount": float(item.total_credit)}
            for item in top_items_query
        ]
    else:
        top_outstanding_items = []
    
    # Top selling items (by total revenue in last 24h) for comparison
    if orders_24h_list:
        order_24h_ids = [o.id for o in orders_24h_list]
        top_selling_query = db.query(
            MenuItem.name,
            func.sum(OrderItem.quantity).label('total_quantity'),
            func.sum(OrderItem.quantity * OrderItem.price).label('total_revenue')
        ).join(
            OrderItem, MenuItem.id == OrderItem.menu_item_id
        ).filter(
            OrderItem.order_id.in_(order_24h_ids)
        ).group_by(
            MenuItem.id, MenuItem.name
        ).order_by(
            func.sum(OrderItem.quantity * OrderItem.price).desc()
        ).limit(3).all()
        
        top_selling_items = [
            {
                "name": item.name, 
                "quantity": int(item.total_quantity),
                "revenue": float(item.total_revenue)
            }
            for item in top_selling_query
        ]
    else:
        top_selling_items = []

    # Sales by area/floor
    from app.models import Floor
    sales_by_area = []
    floors = db.query(Floor).all()
    for floor in floors:
        floor_tables = [t.id for t in floor.tables] if floor.tables else []
        floor_sales = sum(
            order.net_amount or 0 
            for order in orders_24h_list 
            if order.table_id in floor_tables
        )
        if floor_sales > 0:
            sales_by_area.append({
                "area": floor.name,
                "amount": floor_sales
            })
    
    # Peak time data - 24 hourly slots
    peak_time_data = [0] * 24
    hourly_sales = [0.0] * 24
    
    for order in orders_24h_list:
        if order.created_at:
            hours_ago = int((datetime.now() - order.created_at).total_seconds() / 3600)
            if 0 <= hours_ago < 24:
                index = 23 - hours_ago
                peak_time_data[index] += 1
                hourly_sales[index] += (order.net_amount or 0)

    return {
        "occupancy": round(occupancy, 1),
        "total_tables": total_tables,
        "occupied_tables": occupied_tables,
        "sales_24h": sales_24h,
        "paid_sales": paid_sales,
        "credit_sales": credit_sales,
        "discount": discount,
        "orders_24h": len(orders_24h_list),
        "dine_in_count": dine_in_count,
        "takeaway_count": takeaway_count,
        "delivery_count": delivery_count,
        "outstanding_revenue": outstanding_revenue,
        "top_outstanding_items": top_outstanding_items,
        "top_selling_items": top_selling_items,
        "sales_by_area": sales_by_area,
        "peak_time_data": peak_time_data,
        "hourly_sales": hourly_sales,
        "period": "Last 24 Hours"
    }




@router.get("/sales-summary")
async def get_sales_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get sales summary"""
    orders = db.query(Order).filter(Order.status == 'Completed').all()
    total_sales = sum(order.total_amount or 0 for order in orders)
    total_orders = len(orders)
    return {
        "total_sales": total_sales,
        "total_orders": total_orders,
        "average_order_value": total_sales / total_orders if total_orders > 0 else 0
    }


@router.get("/day-book")
async def get_day_book(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get day book (all transactions for today)"""
    today = datetime.now().date()
    orders = db.query(Order).filter(Order.created_at >= today).all()
    return orders


@router.get("/export/pdf/{report_type}")
async def export_pdf(
    report_type: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Export report as PDF"""
    if report_type == "sales-summary":
        result = await get_sales_summary(db, current_user)
        data = [{"Metric": k, "Value": v} for k, v in result.items()]
        pdf_buffer = generate_pdf_report(data, "Sales Summary")
    elif report_type == "day-book":
        orders = await get_day_book(db, current_user)
        data = [{"Order Number": o.order_number, "Total": o.total_amount, "Date": str(o.created_at)} for o in orders]
        pdf_buffer = generate_pdf_report(data, "Day Book")
    else:
        raise HTTPException(status_code=404, detail="Report type not found")
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={report_type}.pdf"}
    )


@router.get("/export/excel/{report_type}")
async def export_excel(
    report_type: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Export report as Excel"""
    if report_type == "sales-summary":
        result = await get_sales_summary(db, current_user)
        data = [{"Metric": k, "Value": v} for k, v in result.items()]
        excel_buffer = generate_excel_report(data, "Sales Summary")
    elif report_type == "day-book":
        orders = await get_day_book(db, current_user)
        data = [{"Order Number": o.order_number, "Total": o.total_amount, "Date": str(o.created_at)} for o in orders]
        excel_buffer = generate_excel_report(data, "Day Book")
    else:
        raise HTTPException(status_code=404, detail="Report type not found")
    
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={report_type}.xlsx"}
    )


@router.get("/orders/{order_id}/invoice")
async def get_order_invoice(
    order_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate invoice PDF for an order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order_data = {
        "order_number": order.order_number,
        "customer": {"name": order.customer.name if order.customer else None},
        "table": {"table_id": order.table.table_id if order.table else None},
        "items": []
    }
    
    pdf_buffer = generate_invoice_pdf(order_data)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{order.order_number}.pdf"}
    )


@router.get("/sessions")
async def get_sessions_report(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all POS sessions for reporting"""
    from app.models.pos_session import POSSession
    from app.models.auth import User
    
    sessions = db.query(POSSession).order_by(POSSession.start_time.desc()).all()
    
    result = []
    for session in sessions:
        user = db.query(User).filter(User.id == session.user_id).first()
        result.append({
            "id": session.id,
            "user_id": session.user_id,
            "user_name": user.full_name if user else "Unknown",
            "start_time": session.start_time.isoformat() if session.start_time else None,
            "end_time": session.end_time.isoformat() if session.end_time else None,
            "status": session.status,
            "opening_balance": session.opening_balance,
            "closing_balance": session.closing_balance,
            "total_sales": session.total_sales,
            "total_orders": session.total_orders,
            "notes": session.notes
        })
    
    return result


@router.get("/export/sessions/pdf")
async def export_sessions_pdf(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Export session report as PDF"""
    from app.models.pos_session import POSSession
    from app.models.auth import User
    from io import BytesIO
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    
    sessions = db.query(POSSession).order_by(POSSession.start_time.desc()).all()
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("<b>Session Report</b>", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.3 * inch))
    
    # Prepare table data
    table_data = [['Session ID', 'Staff', 'Start Time', 'End Time', 'Status', 'Opening', 'Closing', 'Sales', 'Orders']]
    
    for session in sessions:
        user = db.query(User).filter(User.id == session.user_id).first()
        table_data.append([
            f'#{session.id}',
            user.full_name if user else 'Unknown',
            session.start_time.strftime('%Y-%m-%d %H:%M') if session.start_time else '-',
            session.end_time.strftime('%Y-%m-%d %H:%M') if session.end_time else '-',
            session.status,
            f'Rs. {session.opening_balance:,.0f}',
            f'Rs. {session.closing_balance:,.0f}' if session.closing_balance else '-',
            f'Rs. {session.total_sales:,.0f}',
            str(session.total_orders)
        ])
    
    # Create table
    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=session_report.pdf"}
    )
