"""
PDF generation utilities
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from io import BytesIO
from datetime import datetime


def generate_pdf_report(data, title="Report", columns=None):
    """Generate a PDF report from data"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title_para = Paragraph(title, styles['Title'])
    elements.append(title_para)
    elements.append(Spacer(1, 0.2*inch))
    
    # Date
    date_para = Paragraph(
        f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        styles['Normal']
    )
    elements.append(date_para)
    elements.append(Spacer(1, 0.2*inch))
    
    # Table
    if data and len(data) > 0:
        table_data = []
        if columns:
            table_data.append(columns)
        else:
            # Use keys from first item as columns
            if isinstance(data[0], dict):
                table_data.append(list(data[0].keys()))
        
        for row in data:
            if isinstance(row, dict):
                table_data.append([str(v) for v in row.values()])
            else:
                table_data.append([str(v) for v in row])
        
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_invoice_pdf(order_data):
    """Generate an invoice PDF for an order"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Invoice Header
    title = Paragraph("INVOICE", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.3*inch))
    
    # Invoice Details
    invoice_data = [
        ['Invoice Number:', order_data.get('order_number', 'N/A')],
        ['Date:', datetime.now().strftime('%Y-%m-%d')],
        ['Customer:', order_data.get('customer', {}).get('name', 'N/A')],
        ['Table:', order_data.get('table', {}).get('table_id', 'N/A')],
    ]
    
    invoice_table = Table(invoice_data, colWidths=[2*inch, 4*inch])
    invoice_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(invoice_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Items Table
    items_data = [['Item', 'Quantity', 'Price', 'Total']]
    total = 0
    for item in order_data.get('items', []):
        items_data.append([
            item.get('name', 'N/A'),
            str(item.get('quantity', 0)),
            f"रू {item.get('price', 0)}",
            f"रू {item.get('subtotal', 0)}"
        ])
        total += item.get('subtotal', 0)
    
    items_data.append(['', '', 'Total:', f"रू {total}"])
    
    items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(items_table)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
