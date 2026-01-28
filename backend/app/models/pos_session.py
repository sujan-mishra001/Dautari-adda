from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class POSSession(Base):
    """
    POS Session (Staff Shift) model.
    Tracks a user's working session on the POS, including cash handling.
    """
    __tablename__ = "pos_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    
    status = Column(String, default="Active")  # Active, Closed
    
    opening_balance = Column(Float, default=0.0)
    closing_balance = Column(Float, default=0.0)
    
    # Calculated fields (can be updated when closing session or computed)
    total_sales = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    
    notes = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="pos_sessions")
