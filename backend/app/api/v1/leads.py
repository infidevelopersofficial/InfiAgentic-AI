from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.lead import Lead, LeadAction, LeadFlow

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
    lead.last_activity_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(action)
    return LeadActionResponse.model_validate(action)


# Lead Flows Schemas
class LeadFlowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_conditions: dict = {}
    steps: List[dict] = []
    product_id: Optional[UUID] = None


class LeadFlowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_conditions: Optional[dict] = None
    steps: Optional[List[dict]] = None
    is_active: Optional[bool] = None


class LeadFlowResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    trigger_type: str
    is_active: bool
    total_leads: int
    conversion_count: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class LeadFlowList(BaseModel):
    items: List[LeadFlowResponse]
    total: int
    page: int
    limit: int


class LeadFlowStats(BaseModel):
    total_leads: int
    conversion_count: int
    conversion_rate: float
    active_leads: int


# Lead Flows Routes
@router.get("/flows", response_model=LeadFlowList)
async def list_lead_flows(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List lead flows with pagination"""
    query = select(LeadFlow).where(LeadFlow.org_id == current_user.org_id)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(LeadFlow.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return LeadFlowList(
        items=[LeadFlowResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.post("/flows", response_model=LeadFlowResponse, status_code=status.HTTP_201_CREATED)
async def create_lead_flow(
    flow_data: LeadFlowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new lead flow"""
    flow = LeadFlow(
        org_id=current_user.org_id,
        **flow_data.model_dump()
    )
    db.add(flow)
    await db.commit()
    await db.refresh(flow)
    return LeadFlowResponse.model_validate(flow)


@router.get("/flows/{flow_id}", response_model=LeadFlowResponse)
async def get_lead_flow(
    flow_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get lead flow by ID"""
    result = await db.execute(
        select(LeadFlow).where(
            LeadFlow.id == flow_id,
            LeadFlow.org_id == current_user.org_id
        )
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=404, detail="Lead flow not found")
    return LeadFlowResponse.model_validate(flow)


@router.patch("/flows/{flow_id}", response_model=LeadFlowResponse)
async def update_lead_flow(
    flow_id: UUID,
    flow_data: LeadFlowUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update lead flow"""
    result = await db.execute(
        select(LeadFlow).where(
            LeadFlow.id == flow_id,
            LeadFlow.org_id == current_user.org_id
        )
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=404, detail="Lead flow not found")
    
    update_data = flow_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(flow, field, value)
    
    await db.commit()
    await db.refresh(flow)
    return LeadFlowResponse.model_validate(flow)


@router.delete("/flows/{flow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead_flow(
    flow_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete lead flow"""
    result = await db.execute(
        select(LeadFlow).where(
            LeadFlow.id == flow_id,
            LeadFlow.org_id == current_user.org_id
        )
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=404, detail="Lead flow not found")
    
    await db.execute(delete(LeadFlow).where(LeadFlow.id == flow_id))
    await db.commit()


@router.post("/flows/{flow_id}/activate", response_model=LeadFlowResponse)
async def toggle_lead_flow(
    flow_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Activate/deactivate lead flow"""
    result = await db.execute(
        select(LeadFlow).where(
            LeadFlow.id == flow_id,
            LeadFlow.org_id == current_user.org_id
        )
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=404, detail="Lead flow not found")
    
    flow.is_active = not flow.is_active
    await db.commit()
    await db.refresh(flow)
    return LeadFlowResponse.model_validate(flow)


@router.get("/flows/{flow_id}/stats", response_model=LeadFlowStats)
async def get_lead_flow_stats(
    flow_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get lead flow statistics"""
    result = await db.execute(
        select(LeadFlow).where(
            LeadFlow.id == flow_id,
            LeadFlow.org_id == current_user.org_id
        )
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=404, detail="Lead flow not found")
    
    conversion_rate = (flow.conversion_count / flow.total_leads * 100) if flow.total_leads > 0 else 0
    
    return LeadFlowStats(
        total_leads=flow.total_leads,
        conversion_count=flow.conversion_count,
        conversion_rate=round(conversion_rate, 2),
        active_leads=flow.total_leads - flow.conversion_count
    )
