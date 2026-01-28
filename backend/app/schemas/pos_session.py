from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class POSSessionBase(BaseModel):
    opening_balance: float = 0.0
    notes: Optional[str] = None

class POSSessionCreate(POSSessionBase):
    pass

class POSSessionUpdate(BaseModel):
    closing_balance: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    total_sales: Optional[float] = None
    total_orders: Optional[int] = None
    end_time: Optional[datetime] = None

class POSSessionUser(BaseModel):
    id: int
    full_name: str
    role: str
    
    class Config:
        from_attributes = True

class POSSession(POSSessionBase):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    status: str
    closing_balance: float
    total_sales: float
    total_orders: int
    created_at: datetime
    updated_at: Optional[datetime]
    user: Optional[POSSessionUser]

    class Config:
        from_attributes = True
