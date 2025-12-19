from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.lead import Lead, LeadAction

router = APIRouter()


# Schemas
class LeadCreate(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    source: Optional[str] = None
    product_id: Optional[UUID] = None
    tags: List[str] = []


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    score: Optional[int] = None
    assigned_to: Optional[UUID] = None
    tags: Optional[List[str]] = None


class LeadResponse(BaseModel):
    id: UUID
    email: str
    phone: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    company: Optional[str]
    source: Optional[str]
    status: str
    score: int
    tags: List[str]
    created_at: datetime
    
    model_config = {"from_attributes": True}


class LeadList(BaseModel):
    items: List[LeadResponse]
    total: int
    page: int
    limit: int


class LeadActionCreate(BaseModel):
    action_type: str
    description: Optional[str] = None
    metadata: dict = {}


class LeadActionResponse(BaseModel):
    id: UUID
    lead_id: UUID
    action_type: str
    description: Optional[str]
    created_at: datetime
    
    model_config = {"from_attributes": True}


# Routes
@router.get("/", response_model=LeadList)
async def list_leads(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    source: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List leads with filters"""
    query = select(Lead).where(Lead.org_id == current_user.org_id)
    
    if status:
        query = query.where(Lead.status == status)
    if source:
        query = query.where(Lead.source == source)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(Lead.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return LeadList(
        items=[LeadResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead_data: LeadCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new lead"""
    lead = Lead(
        org_id=current_user.org_id,
        **lead_data.model_dump()
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get lead by ID"""
    result = await db.execute(
        select(Lead).where(
            Lead.id == lead_id,
            Lead.org_id == current_user.org_id
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse.model_validate(lead)


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: UUID,
    lead_data: LeadUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update lead"""
    result = await db.execute(
        select(Lead).where(
            Lead.id == lead_id,
            Lead.org_id == current_user.org_id
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_data = lead_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)
    
    await db.commit()
    await db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.post("/{lead_id}/actions", response_model=LeadActionResponse, status_code=status.HTTP_201_CREATED)
async def create_lead_action(
    lead_id: UUID,
    action_data: LeadActionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Log an action on a lead"""
    result = await db.execute(
        select(Lead).where(
            Lead.id == lead_id,
            Lead.org_id == current_user.org_id
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    action_payload = action_data.model_dump()
    metadata_payload = action_payload.pop("metadata", {})
    action = LeadAction(
        lead_id=lead_id,
        user_id=current_user.id,
        meta=metadata_payload,
        **action_payload,
    )
    db.add(action)
    
    # Update last activity
    from datetime import datetime
    lead.last_activity_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(action)
    return LeadActionResponse.model_validate(action)
