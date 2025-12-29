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
from app.models.email import EmailTemplate, EmailCampaign

router = APIRouter()


# Schemas
class EmailTemplateCreate(BaseModel):
    name: str
    subject: str
    html_body: str
    plain_body: Optional[str] = None
    template_type: Optional[str] = None
    variables: List[str] = []


class EmailTemplateResponse(BaseModel):
    id: UUID
    name: str
    subject: str
    template_type: Optional[str]
    variables: List[str]
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class EmailCampaignCreate(BaseModel):
    name: str
    subject: str
    html_body: str
    plain_body: Optional[str] = None
    from_name: Optional[str] = None
    from_email: Optional[str] = None
    template_id: Optional[UUID] = None
    product_id: Optional[UUID] = None
    scheduled_at: Optional[datetime] = None


class EmailCampaignResponse(BaseModel):
    id: UUID
    name: str
    subject: str
    status: str
    total_recipients: int
    sent_count: int
    open_count: int
    click_count: int
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    created_at: datetime
    
    model_config = {"from_attributes": True}


class EmailCampaignList(BaseModel):
    items: List[EmailCampaignResponse]
    total: int
    page: int
    limit: int


# Routes
@router.get("/templates", response_model=List[EmailTemplateResponse])
async def list_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List email templates"""
    result = await db.execute(
        select(EmailTemplate).where(EmailTemplate.org_id == current_user.org_id)
    )
    templates = result.scalars().all()
    return [EmailTemplateResponse.model_validate(t) for t in templates]


@router.post("/templates", response_model=EmailTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: EmailTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create email template"""
    template = EmailTemplate(
        org_id=current_user.org_id,
        **template_data.model_dump()
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return EmailTemplateResponse.model_validate(template)


@router.get("/campaigns", response_model=EmailCampaignList)
async def list_campaigns(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List email campaigns"""
    query = select(EmailCampaign).where(EmailCampaign.org_id == current_user.org_id)
    
    if status:
        query = query.where(EmailCampaign.status == status)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(EmailCampaign.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return EmailCampaignList(
        items=[EmailCampaignResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.post("/campaigns", response_model=EmailCampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: EmailCampaignCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create email campaign"""
    campaign = EmailCampaign(
        org_id=current_user.org_id,
        **campaign_data.model_dump()
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return EmailCampaignResponse.model_validate(campaign)


class EmailCampaignUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    html_body: Optional[str] = None
    plain_body: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None


@router.get("/campaigns/{campaign_id}", response_model=EmailCampaignResponse)
async def get_campaign(
    campaign_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get email campaign by ID"""
    result = await db.execute(
        select(EmailCampaign).where(
            EmailCampaign.id == campaign_id,
            EmailCampaign.org_id == current_user.org_id
        )
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return EmailCampaignResponse.model_validate(campaign)


@router.patch("/campaigns/{campaign_id}", response_model=EmailCampaignResponse)
async def update_campaign(
    campaign_id: UUID,
    campaign_data: EmailCampaignUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update email campaign"""
    result = await db.execute(
        select(EmailCampaign).where(
            EmailCampaign.id == campaign_id,
            EmailCampaign.org_id == current_user.org_id
        )
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    update_data = campaign_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)
    
    await db.commit()
    await db.refresh(campaign)
    return EmailCampaignResponse.model_validate(campaign)


@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete email campaign"""
    result = await db.execute(
        select(EmailCampaign).where(
            EmailCampaign.id == campaign_id,
            EmailCampaign.org_id == current_user.org_id
        )
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    from app.models.email import EmailCampaign
    await db.execute(delete(EmailCampaign).where(EmailCampaign.id == campaign_id))
    await db.commit()


@router.post("/campaigns/{campaign_id}/send", response_model=EmailCampaignResponse)
async def send_campaign(
    campaign_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send email campaign"""
    result = await db.execute(
        select(EmailCampaign).where(
            EmailCampaign.id == campaign_id,
            EmailCampaign.org_id == current_user.org_id
        )
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.status == "sent":
        raise HTTPException(status_code=400, detail="Campaign already sent")
    
    campaign.status = "active"
    campaign.sent_at = datetime.utcnow()
    # In production, this would trigger async sending via Celery
    await db.commit()
    await db.refresh(campaign)
    
    return EmailCampaignResponse.model_validate(campaign)
