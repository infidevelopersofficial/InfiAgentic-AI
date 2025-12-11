from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr
from datetime import datetime
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.lead import Contact, Deal

router = APIRouter()


# Schemas
class ContactCreate(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    tags: List[str] = []


class ContactResponse(BaseModel):
    id: UUID
    email: str
    phone: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    company: Optional[str]
    is_subscribed: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ContactList(BaseModel):
    items: List[ContactResponse]
    total: int
    page: int
    limit: int


class DealCreate(BaseModel):
    name: str
    contact_id: Optional[UUID] = None
    product_id: Optional[UUID] = None
    value: Optional[Decimal] = None
    currency: str = "INR"
    stage: str = "prospecting"
    expected_close_date: Optional[datetime] = None


class DealUpdate(BaseModel):
    stage: Optional[str] = None
    value: Optional[Decimal] = None
    probability: Optional[int] = None
    assigned_to: Optional[UUID] = None
    notes: Optional[str] = None


class DealResponse(BaseModel):
    id: UUID
    name: str
    contact_id: Optional[UUID]
    value: Optional[Decimal]
    currency: str
    stage: str
    probability: int
    expected_close_date: Optional[datetime]
    created_at: datetime
    
    model_config = {"from_attributes": True}


class DealList(BaseModel):
    items: List[DealResponse]
    total: int
    page: int
    limit: int


# Routes
@router.get("/contacts", response_model=ContactList)
async def list_contacts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List contacts"""
    query = select(Contact).where(Contact.org_id == current_user.org_id)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(Contact.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return ContactList(
        items=[ContactResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.post("/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_data: ContactCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create contact"""
    contact = Contact(
        org_id=current_user.org_id,
        **contact_data.model_dump()
    )
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return ContactResponse.model_validate(contact)


@router.get("/deals", response_model=DealList)
async def list_deals(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    stage: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List deals"""
    query = select(Deal).where(Deal.org_id == current_user.org_id)
    
    if stage:
        query = query.where(Deal.stage == stage)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(Deal.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return DealList(
        items=[DealResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.post("/deals", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
async def create_deal(
    deal_data: DealCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create deal"""
    deal = Deal(
        org_id=current_user.org_id,
        **deal_data.model_dump()
    )
    db.add(deal)
    await db.commit()
    await db.refresh(deal)
    return DealResponse.model_validate(deal)


@router.patch("/deals/{deal_id}", response_model=DealResponse)
async def update_deal(
    deal_id: UUID,
    deal_data: DealUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update deal"""
    result = await db.execute(
        select(Deal).where(
            Deal.id == deal_id,
            Deal.org_id == current_user.org_id
        )
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    update_data = deal_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(deal, field, value)
    
    await db.commit()
    await db.refresh(deal)
    return DealResponse.model_validate(deal)
