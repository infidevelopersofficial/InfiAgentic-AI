from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.content import Content

router = APIRouter()


# Approval model - using content status as approval mechanism
# In production, you might have a separate ApprovalRequest model
class ApprovalResponse(BaseModel):
    id: UUID
    type: str  # content, campaign, workflow
    item_id: UUID
    title: str
    description: Optional[str]
    requested_by: UUID
    requested_at: datetime
    status: str  # pending, approved, rejected
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    comments: Optional[str] = None
    
    model_config = {"from_attributes": True}


class ApprovalList(BaseModel):
    items: List[ApprovalResponse]
    total: int
    page: int
    limit: int


class ApprovalAction(BaseModel):
    comments: Optional[str] = None


@router.get("/", response_model=ApprovalList)
async def list_approvals(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    approval_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List pending approvals"""
    approvals: List[ApprovalResponse] = []
    
    # Get content items pending review
    content_query = select(Content).where(
        Content.org_id == current_user.org_id,
        Content.status == "pending_review"
    )
    
    if status_filter and status_filter != "pending":
        # For approved/rejected, we'd need to track that separately
        # For now, we only show pending
        pass
    
    content_result = await db.execute(content_query)
    contents = content_result.scalars().all()
    
    for content in contents:
        approvals.append(ApprovalResponse(
            id=content.id,
            type="content",
            item_id=content.id,
            title=content.title or f"Content {content.id}",
            description=f"Content type: {content.content_type}",
            requested_by=content.created_by,
            requested_at=content.created_at,
            status="pending",
            reviewed_by=None,
            reviewed_at=None,
            comments=None
        ))
    
    # Get email campaigns pending review (if status exists)
    from app.models.email import EmailCampaign
    email_query = select(EmailCampaign).where(
        EmailCampaign.org_id == current_user.org_id,
        EmailCampaign.status == "pending_review"
    )
    email_result = await db.execute(email_query)
    campaigns = email_result.scalars().all()
    
    for campaign in campaigns:
        approvals.append(ApprovalResponse(
            id=campaign.id,
            type="campaign",
            item_id=campaign.id,
            title=campaign.name,
            description=f"Email campaign: {campaign.subject}",
            requested_by=campaign.created_by if hasattr(campaign, 'created_by') else current_user.id,
            requested_at=campaign.created_at,
            status="pending",
            reviewed_by=None,
            reviewed_at=None,
            comments=None
        ))
    
    # Filter by type if provided
    if approval_type:
        approvals = [a for a in approvals if a.type == approval_type]
    
    # Sort by requested_at
    approvals.sort(key=lambda x: x.requested_at, reverse=True)
    
    # Paginate
    total = len(approvals)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_approvals = approvals[start_idx:end_idx]
    
    return ApprovalList(
        items=paginated_approvals,
        total=total,
        page=page,
        limit=limit
    )


@router.post("/{approval_id}/approve", response_model=ApprovalResponse)
async def approve_item(
    approval_id: UUID,
    action_data: ApprovalAction,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve an item"""
    # Find the item based on type
    # For content
    content_result = await db.execute(
        select(Content).where(
            Content.id == approval_id,
            Content.org_id == current_user.org_id,
            Content.status == "pending_review"
        )
    )
    content = content_result.scalar_one_or_none()
    
    if content:
        content.status = "approved"
        # In production, you'd update reviewed_by and reviewed_at fields
        await db.commit()
        await db.refresh(content)
        
        return ApprovalResponse(
            id=content.id,
            type="content",
            item_id=content.id,
            title=content.title or f"Content {content.id}",
            description=f"Content type: {content.content_type}",
            requested_by=content.created_by,
            requested_at=content.created_at,
            status="approved",
            reviewed_by=current_user.id,
            reviewed_at=datetime.utcnow(),
            comments=action_data.comments
        )
    
    # Check email campaigns
    from app.models.email import EmailCampaign
    campaign_result = await db.execute(
        select(EmailCampaign).where(
            EmailCampaign.id == approval_id,
            EmailCampaign.org_id == current_user.org_id,
            EmailCampaign.status == "pending_review"
        )
    )
    campaign = campaign_result.scalar_one_or_none()
    
    if campaign:
        campaign.status = "approved"
        await db.commit()
        await db.refresh(campaign)
        
        return ApprovalResponse(
            id=campaign.id,
            type="campaign",
            item_id=campaign.id,
            title=campaign.name,
            description=f"Email campaign: {campaign.subject}",
            requested_by=campaign.created_by if hasattr(campaign, 'created_by') else current_user.id,
            requested_at=campaign.created_at,
            status="approved",
            reviewed_by=current_user.id,
            reviewed_at=datetime.utcnow(),
            comments=action_data.comments
        )
    
    raise HTTPException(status_code=404, detail="Approval request not found")


@router.post("/{approval_id}/reject", response_model=ApprovalResponse)
async def reject_item(
    approval_id: UUID,
    action_data: ApprovalAction,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Reject an item"""
    # Find the item based on type
    # For content
    content_result = await db.execute(
        select(Content).where(
            Content.id == approval_id,
            Content.org_id == current_user.org_id,
            Content.status == "pending_review"
        )
    )
    content = content_result.scalar_one_or_none()
    
    if content:
        content.status = "rejected"
        await db.commit()
        await db.refresh(content)
        
        return ApprovalResponse(
            id=content.id,
            type="content",
            item_id=content.id,
            title=content.title or f"Content {content.id}",
            description=f"Content type: {content.content_type}",
            requested_by=content.created_by,
            requested_at=content.created_at,
            status="rejected",
            reviewed_by=current_user.id,
            reviewed_at=datetime.utcnow(),
            comments=action_data.comments
        )
    
    # Check email campaigns
    from app.models.email import EmailCampaign
    campaign_result = await db.execute(
        select(EmailCampaign).where(
            EmailCampaign.id == approval_id,
            EmailCampaign.org_id == current_user.org_id,
            EmailCampaign.status == "pending_review"
        )
    )
    campaign = campaign_result.scalar_one_or_none()
    
    if campaign:
        campaign.status = "rejected"
        await db.commit()
        await db.refresh(campaign)
        
        return ApprovalResponse(
            id=campaign.id,
            type="campaign",
            item_id=campaign.id,
            title=campaign.name,
            description=f"Email campaign: {campaign.subject}",
            requested_by=campaign.created_by if hasattr(campaign, 'created_by') else current_user.id,
            requested_at=campaign.created_at,
            status="rejected",
            reviewed_by=current_user.id,
            reviewed_at=datetime.utcnow(),
            comments=action_data.comments
        )
    
    raise HTTPException(status_code=404, detail="Approval request not found")

