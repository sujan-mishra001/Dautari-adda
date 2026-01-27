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
    """Get summarized data for the admin dashboard"""
    from app.models import Table, Order
    
    total_tables = db.query(Table).count()
    occupied_tables = db.query(Table).filter(Table.status == 'Occupied').count()
    occupancy = (occupied_tables / total_tables * 100) if total_tables > 0 else 0
    
    today = datetime.now().date()
    orders_today_list = db.query(Order).filter(Order.created_at >= today).all()
    
    # Sales breakdown
    sales_today = sum(order.net_amount or 0 for order in orders_today_list)
    paid_sales = sum(order.paid_amount or 0 for order in orders_today_list)
    credit_sales = sum(order.credit_amount or 0 for order in orders_today_list)
    discount = sum(order.discount_amount or 0 for order in orders_today_list)
    
    # Order type breakdown
    dine_in_count = len([o for o in orders_today_list if o.order_type == 'Dine-In'])
    takeaway_count = len([o for o in orders_today_list if o.order_type == 'Takeaway'])
    delivery_count = len([o for o in orders_today_list if o.order_type == 'Delivery'])

    # Outstanding revenue (all time credit)
    outstanding_revenue = sum(order.credit_amount or 0 for order in db.query(Order).all())

    return {
        "occupancy": round(occupancy, 1),
        "total_tables": total_tables,
        "occupied_tables": occupied_tables,
        "sales_today": sales_today,
        "paid_sales": paid_sales,
        "credit_sales": credit_sales,
        "discount": discount,
        "orders_today": len(orders_today_list),
        "dine_in_count": dine_in_count,
        "takeaway_count": takeaway_count,
        "delivery_count": delivery_count,
        "outstanding_revenue": outstanding_revenue,
        "sales_by_area": [],
        "peak_time_data": [0, 0, 0, 0, 0, 0, 0]
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
