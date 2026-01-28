from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.pos_session import POSSession
from app.models.auth import User
from app.schemas.pos_session import POSSession as POSSessionSchema, POSSessionCreate, POSSessionUpdate
from app.dependencies import get_current_user

router = APIRouter()

def auto_close_old_sessions(db: Session):
    """Automatically close sessions that have been active for more than 24 hours"""
    from datetime import datetime, timedelta
    
    cutoff_time = datetime.now() - timedelta(hours=24)
    
    # Find all active sessions older than 24 hours
    old_sessions = db.query(POSSession).filter(
        POSSession.status == "Active",
        POSSession.start_time < cutoff_time
    ).all()
    
    for session in old_sessions:
        session.status = "Closed"
        session.end_time = datetime.now()
        # Note: Ideally, we'd calculate actual sales/orders here
        # For now, we're just marking it closed
        db.add(session)
    
    if old_sessions:
        db.commit()
    
    return len(old_sessions)

@router.get("/", response_model=List[POSSessionSchema])
def read_sessions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Auto-close sessions older than 24 hours
    auto_close_old_sessions(db)
    
    sessions = db.query(POSSession).order_by(POSSession.start_time.desc()).offset(skip).limit(limit).all()
    return sessions

@router.post("/", response_model=POSSessionSchema)
def create_session(
    session_in: POSSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user already has an active session
    active_session = db.query(POSSession).filter(
        POSSession.user_id == current_user.id,
        POSSession.status == "Active"
    ).first()
    
    if active_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active session"
        )
        
    db_session = POSSession(
        user_id=current_user.id,
        opening_balance=session_in.opening_balance,
        notes=session_in.notes,
        status="Active",
        start_time=datetime.now()
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/{id}", response_model=POSSessionSchema)
def read_session(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(POSSession).filter(POSSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.put("/{id}", response_model=POSSessionSchema)
def update_session(
    id: int,
    session_in: POSSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_session = db.query(POSSession).filter(POSSession.id == id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # If checking ownership:
    # if db_session.user_id != current_user.id and current_user.role != 'admin':
    #     raise HTTPException(status_code=403, detail="Not authorized to update this session")

    update_data = session_in.dict(exclude_unset=True)
    
    # If closing the session
    if session_in.status == "Closed" and db_session.status == "Active":
        update_data["end_time"] = datetime.now()
        
    for field, value in update_data.items():
        setattr(db_session, field, value)
        
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session
