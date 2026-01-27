"""
Excel generation utilities
"""
from io import BytesIO
import pandas as pd


def generate_excel_report(data, title="Report", columns=None):
    """Generate an Excel report from data"""
    buffer = BytesIO()
    
    if isinstance(data, list) and len(data) > 0:
        if isinstance(data[0], dict):
            df = pd.DataFrame(data)
        else:
            if columns:
                df = pd.DataFrame(data, columns=columns)
            else:
                df = pd.DataFrame(data)
    else:
        df = pd.DataFrame()
    
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name=title[:31], index=False)
    
    buffer.seek(0)
    return buffer
