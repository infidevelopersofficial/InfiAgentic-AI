"""
Email API endpoints for campaigns, templates, and automations.
Supports SendGrid, Mailgun, and SMTP email providers.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, and_
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime, timedelta
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.email import EmailTemplate, EmailCampaign, EmailAutomation
from app.schemas.email import (
    EmailTemplateCreate,
    EmailTemplateUpdate,
    EmailTemplateResponse,
    EmailTemplateList,
    EmailCampaignCreate,
    EmailCampaignUpdate,
    EmailCampaignResponse,
    EmailCampaignList,
    EmailAutomationCreate,
    EmailAutomationUpdate,
    EmailAutomationResponse,
    EmailAutomationList,
    SendCampaignRequest,
    SendCampaignResponse,
    CampaignMetricsResponse,
    AggregatedEmailMetricsResponse,
    TestEmailRequest,
    TestEmailResponse,
    BulkSendRequest,
    BulkSendResponse,
)
from app.tasks.email_tasks import send_campaign_emails, sync_email_metrics

router = APIRouter()
logger = logging.getLogger(__name__)


# ============================================================================
# EMAIL TEMPLATES
# ============================================================================

@router.post("/templates", response_model=EmailTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_email_template(
    template_data: EmailTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new email template.
    Templates can be reused across multiple campaigns.
    """
    # Check name is unique
    result = await db.execute(
        select(EmailTemplate).where(
            and_(
                EmailTemplate.org_id == current_user.org_id,
                EmailTemplate.name == template_data.name
            )
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Template with this name already exists"
        )
    
    template = EmailTemplate(
        org_id=current_user.org_id,
        name=template_data.name,
        subject=template_data.subject,
        html_body=template_data.html_body,
        plain_body=template_data.plain_body or template_data.html_body,
        template_type=template_data.template_type,
        variables=template_data.variables
    )
    
    db.add(template)
    await db.commit()
    await db.refresh(template)
    
    logger.info(f"Created email template {template.id} for org {current_user.org_id}")
    return EmailTemplateResponse.model_validate(template)


@router.get("/templates", response_model=EmailTemplateList)
async def list_email_templates(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    template_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List email templates with pagination and filters"""
    query = select(EmailTemplate).where(EmailTemplate.org_id == current_user.org_id)
    
    if template_type:
        query = query.where(EmailTemplate.template_type == template_type)
    if is_active is not None:
        query = query.where(EmailTemplate.is_active == is_active)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(EmailTemplate.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return EmailTemplateList(
        items=[EmailTemplateResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.get("/templates/{template_id}", response_model=EmailTemplateResponse)
async def get_email_template(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get email template details"""
    result = await db.execute(
        select(EmailTemplate).where(
            and_(
                EmailTemplate.id == template_id,
                EmailTemplate.org_id == current_user.org_id
            )
        )
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")
    
    return EmailTemplateResponse.model_validate(template)


@router.patch("/templates/{template_id}", response_model=EmailTemplateResponse)
async def update_email_template(
    template_id: UUID,
    template_data: EmailTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update email template"""
    result = await db.execute(
        select(EmailTemplate).where(
            and_(
                EmailTemplate.id == template_id,
                EmailTemplate.org_id == current_user.org_id
            )
        )
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")
    
    update_data = template_data.model_dump(exclude_unset=True, exclude_none=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    await db.commit()
    await db.refresh(template)
    return EmailTemplateResponse.model_validate(template)


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_email_template(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete email template"""
    result = await db.execute(
        select(EmailTemplate).where(
            and_(
                EmailTemplate.id == template_id,
                EmailTemplate.org_id == current_user.org_id
            )
        )
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")
    
    await db.delete(template)
    await db.commit()
    logger.info(f"Deleted email template {template_id}")


# ============================================================================
# EMAIL CAMPAIGNS
# ============================================================================

@router.post("/campaigns", response_model=EmailCampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_email_campaign(
    campaign_data: EmailCampaignCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create new email campaign (draft or scheduled).
    """
    # Verify template if provided
    if campaign_data.template_id:
        result = await db.execute(
            select(EmailTemplate).where(
                and_(
                    EmailTemplate.id == campaign_data.template_id,
                    EmailTemplate.org_id == current_user.org_id
                )
            )
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Email template not found")
    
    # Verify product if provided
    if campaign_data.product_id:
        from app.models.product import Product
        result = await db.execute(
            select(Product).where(
                and_(
                    Product.id == campaign_data.product_id,
                    Product.org_id == current_user.org_id
                )
            )
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Product not found")
    
    campaign = EmailCampaign(
        org_id=current_user.org_id,
        name=campaign_data.name,
        subject=campaign_data.subject,
        html_body=campaign_data.html_body,
        plain_body=campaign_data.plain_body or campaign_data.html_body,
        from_name=campaign_data.from_name or "noreply",
        from_email=campaign_data.from_email,
        reply_to=campaign_data.reply_to or campaign_data.from_email,
        template_id=campaign_data.template_id,
        product_id=campaign_data.product_id,
        audience_filter=campaign_data.audience_filter,
        scheduled_at=campaign_data.scheduled_at,
        status="scheduled" if campaign_data.scheduled_at else "draft"
    )
    
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    
    logger.info(f"Created email campaign {campaign.id} for org {current_user.org_id}")
    return EmailCampaignResponse.model_validate(campaign)


@router.get("/campaigns", response_model=EmailCampaignList)
async def list_email_campaigns(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    product_id: Optional[UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List email campaigns with pagination and filters"""
    query = select(EmailCampaign).where(EmailCampaign.org_id == current_user.org_id)
    
    if status:
        query = query.where(EmailCampaign.status == status)
    if product_id:
        query = query.where(EmailCampaign.product_id == product_id)
    
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


@router.get("/campaigns/{campaign_id}", response_model=EmailCampaignResponse)
async def get_email_campaign(
    campaign_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get email campaign details"""
    result = await db.execute(
        select(EmailCampaign).where(
            and_(
                EmailCampaign.id == campaign_id,
                EmailCampaign.org_id == current_user.org_id
            )
        )
    )
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Email campaign not found")
    
    return EmailCampaignResponse.model_validate(campaign)


@router.patch("/campaigns/{campaign_id}", response_model=EmailCampaignResponse)
async def update_email_campaign(
    campaign_id: UUID,
    campaign_data: EmailCampaignUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update email campaign (draft/scheduled only)"""
    result = await db.execute(
        select(EmailCampaign).where(
            and_(
                EmailCampaign.id == campaign_id,
                EmailCampaign.org_id == current_user.org_id
            )
        )
    )
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Email campaign not found")
    
    if campaign.status in ["sent", "sending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update sent or sending campaigns"
        )
    
    update_data = campaign_data.model_dump(exclude_unset=True, exclude_none=True)
    for field, value in update_data.items():
        if field == "status" and value in ["sent"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Use /send endpoint to mark as sent"
            )
        setattr(campaign, field, value)
    
    await db.commit()
    await db.refresh(campaign)
    return EmailCampaignResponse.model_validate(campaign)


@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_email_campaign(
    campaign_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete email campaign (draft/scheduled only)"""
    result = await db.execute(
        select(EmailCampaign).where(
            and_(
                EmailCampaign.id == campaign_id,
                EmailCampaign.org_id == current_user.org_id
            )
        )
    )
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Email campaign not found")
    
    if campaign.status in ["sent", "sending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete sent or sending campaigns"
        )
    
    await db.delete(campaign)
    await db.commit()
    logger.info(f"Deleted email campaign {campaign_id}")


# ============================================================================
# SENDING
# ============================================================================

@router.post("/campaigns/{campaign_id}/send", response_model=SendCampaignResponse)
async def send_email_campaign(
    campaign_id: UUID,
    request: SendCampaignRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Send email campaign to recipients.
    Sends asynchronously via Celery.
    """
    result = await db.execute(
        select(EmailCampaign).where(
            and_(
                EmailCampaign.id == campaign_id,
                EmailCampaign.org_id == current_user.org_id
            )
        )
    )
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Email campaign not found")
    
    if campaign.status == "sent":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Campaign already sent"
        )
    
    if not request.recipient_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No recipients specified"
        )
    
    # Update campaign status
    campaign.status = "sending"
    campaign.total_recipients = len(request.recipient_ids)
    await db.commit()
    
    # Queue sending task
    background_tasks.add_task(
        send_campaign_emails.delay,
        str(campaign_id),
        request.recipient_ids,
        current_user.org_id
    )
    
    logger.info(f"Queued sending campaign {campaign_id} to {len(request.recipient_ids)} recipients")
    
    return SendCampaignResponse(
        campaign_id=campaign_id,
        status="queued",
        total_queued=len(request.recipient_ids),
        estimated_send_time="Immediately"
    )


@router.post("/campaigns/bulk/send", response_model=BulkSendResponse)
async def bulk_send_campaigns(
    request: BulkSendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Send multiple campaigns at once"""
    result = await db.execute(
        select(EmailCampaign).where(
            and_(
                EmailCampaign.id.in_(request.campaign_ids),
                EmailCampaign.org_id == current_user.org_id,
                EmailCampaign.status != "sent"
            )
        )
    )
    campaigns = result.scalars().all()
    
    if not campaigns:
        raise HTTPException(status_code=404, detail="No campaigns found")
    
    queued = 0
    failed = 0
    results = {}
    
    for campaign in campaigns:
        try:
            campaign.status = "sending"
            
            # Queue task (would get recipient IDs from audience_filter in production)
            background_tasks.add_task(
                send_campaign_emails.delay,
                str(campaign.id),
                [],  # Recipients determined by audience_filter
                current_user.org_id
            )
            
            queued += 1
            results[str(campaign.id)] = "queued"
        except Exception as e:
            failed += 1
            results[str(campaign.id)] = f"failed: {str(e)}"
    
    await db.commit()
    
    return BulkSendResponse(
        queued=queued,
        failed=failed,
        results=results
    )


@router.post("/test-email", response_model=TestEmailResponse)
async def send_test_email(
    request: TestEmailRequest,
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Send test email to verify content and delivery"""
    from app.tasks.email_tasks import send_test_email_task
    
    # Queue test email
    background_tasks.add_task(
        send_test_email_task.delay,
        request.recipient_email,
        request.subject,
        request.html_body,
        request.plain_body,
        current_user.org_id
    )
    
    logger.info(f"Test email queued for {request.recipient_email}")
    
    return TestEmailResponse(
        status="queued",
        message_id="test_email",
        recipient=request.recipient_email
    )


# ============================================================================
# AUTOMATIONS
# ============================================================================

@router.post("/automations", response_model=EmailAutomationResponse, status_code=status.HTTP_201_CREATED)
async def create_email_automation(
    automation_data: EmailAutomationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create email automation (drip campaigns, triggered sequences).
    """
    # Verify all templates exist
    template_ids = [step.template_id for step in automation_data.email_sequence]
    result = await db.execute(
        select(EmailTemplate).where(
            and_(
                EmailTemplate.id.in_(template_ids),
                EmailTemplate.org_id == current_user.org_id
            )
        )
    )
    templates = result.scalars().all()
    
    if len(templates) != len(template_ids):
        raise HTTPException(status_code=404, detail="One or more email templates not found")
    
    automation = EmailAutomation(
        org_id=current_user.org_id,
        name=automation_data.name,
        description=automation_data.description,
        trigger_type=automation_data.trigger_type,
        trigger_conditions=automation_data.trigger_conditions,
        email_sequence=[step.model_dump() for step in automation_data.email_sequence],
        is_active=True
    )
    
    db.add(automation)
    await db.commit()
    await db.refresh(automation)
    
    logger.info(f"Created email automation {automation.id} for org {current_user.org_id}")
    return EmailAutomationResponse.model_validate(automation)


@router.get("/automations", response_model=EmailAutomationList)
async def list_email_automations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    trigger_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List email automations"""
    query = select(EmailAutomation).where(EmailAutomation.org_id == current_user.org_id)
    
    if trigger_type:
        query = query.where(EmailAutomation.trigger_type == trigger_type)
    if is_active is not None:
        query = query.where(EmailAutomation.is_active == is_active)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(EmailAutomation.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return EmailAutomationList(
        items=[EmailAutomationResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.get("/automations/{automation_id}", response_model=EmailAutomationResponse)
async def get_email_automation(
    automation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get automation details"""
    result = await db.execute(
        select(EmailAutomation).where(
            and_(
                EmailAutomation.id == automation_id,
                EmailAutomation.org_id == current_user.org_id
            )
        )
    )
    automation = result.scalar_one_or_none()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Email automation not found")
    
    return EmailAutomationResponse.model_validate(automation)


@router.patch("/automations/{automation_id}", response_model=EmailAutomationResponse)
async def update_email_automation(
    automation_id: UUID,
    automation_data: EmailAutomationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update email automation"""
    result = await db.execute(
        select(EmailAutomation).where(
            and_(
                EmailAutomation.id == automation_id,
                EmailAutomation.org_id == current_user.org_id
            )
        )
    )
    automation = result.scalar_one_or_none()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Email automation not found")
    
    update_data = automation_data.model_dump(exclude_unset=True, exclude_none=True)
    for field, value in update_data.items():
        if field == "email_sequence" and value:
            setattr(automation, field, [step.model_dump() for step in value])
        else:
            setattr(automation, field, value)
    
    await db.commit()
    await db.refresh(automation)
    return EmailAutomationResponse.model_validate(automation)


@router.delete("/automations/{automation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_email_automation(
    automation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete email automation"""
    result = await db.execute(
        select(EmailAutomation).where(
            and_(
                EmailAutomation.id == automation_id,
                EmailAutomation.org_id == current_user.org_id
            )
        )
    )
    automation = result.scalar_one_or_none()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Email automation not found")
    
    await db.delete(automation)
    await db.commit()
    logger.info(f"Deleted email automation {automation_id}")


# ============================================================================
# ANALYTICS
# ============================================================================

@router.get("/analytics", response_model=AggregatedEmailMetricsResponse)
async def get_aggregated_email_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get aggregated email metrics"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    result = await db.execute(
        select(EmailCampaign).where(
            and_(
                EmailCampaign.org_id == current_user.org_id,
                EmailCampaign.created_at >= cutoff_date,
                EmailCampaign.status != "draft"
            )
        )
    )
    campaigns = result.scalars().all()
    
    if not campaigns:
        raise HTTPException(status_code=404, detail="No campaigns found")
    
    total_recipients = sum(c.total_recipients for c in campaigns)
    total_sent = sum(c.sent_count for c in campaigns)
    total_delivered = sum(c.delivered_count for c in campaigns)
    total_opens = sum(c.open_count for c in campaigns)
    total_clicks = sum(c.click_count for c in campaigns)
    total_bounces = sum(c.bounce_count for c in campaigns)
    total_unsubscribes = sum(c.unsubscribe_count for c in campaigns)
    
    avg_open_rate = (total_opens / max(total_sent, 1)) * 100
    avg_click_rate = (total_clicks / max(total_sent, 1)) * 100
    avg_bounce_rate = (total_bounces / max(total_sent, 1)) * 100
    
    # Find best performer
    top_campaign = None
    if campaigns:
        sorted_campaigns = sorted(
            campaigns,
            key=lambda c: (c.open_count + c.click_count),
            reverse=True
        )
        best = sorted_campaigns[0]
        top_campaign = CampaignMetricsResponse(
            campaign_id=best.id,
            total_recipients=best.total_recipients,
            sent_count=best.sent_count,
            delivered_count=best.delivered_count,
            open_count=best.open_count,
            click_count=best.click_count,
            bounce_count=best.bounce_count,
            unsubscribe_count=best.unsubscribe_count,
            spam_count=best.spam_count,
            open_rate=(best.open_count / max(best.sent_count, 1)) * 100,
            click_rate=(best.click_count / max(best.sent_count, 1)) * 100,
            bounce_rate=(best.bounce_count / max(best.sent_count, 1)) * 100,
            delivery_rate=(best.delivered_count / max(best.sent_count, 1)) * 100,
            last_updated=best.updated_at
        )
    
    return AggregatedEmailMetricsResponse(
        total_campaigns=len(campaigns),
        total_recipients=total_recipients,
        total_sent=total_sent,
        total_delivered=total_delivered,
        total_opens=total_opens,
        total_clicks=total_clicks,
        total_bounces=total_bounces,
        total_unsubscribes=total_unsubscribes,
        avg_open_rate=round(avg_open_rate, 2),
        avg_click_rate=round(avg_click_rate, 2),
        avg_bounce_rate=round(avg_bounce_rate, 2),
        best_performing_campaign=top_campaign,
        date_range_start=cutoff_date,
        date_range_end=datetime.utcnow()
    )


@router.get("/campaigns/{campaign_id}/metrics", response_model=CampaignMetricsResponse)
async def get_campaign_metrics(
    campaign_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Get campaign metrics and trigger sync if needed"""
    result = await db.execute(
        select(EmailCampaign).where(
            and_(
                EmailCampaign.id == campaign_id,
                EmailCampaign.org_id == current_user.org_id
            )
        )
    )
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Trigger metrics sync
    background_tasks.add_task(
        sync_email_metrics.delay,
        str(campaign_id)
    )
    
    open_rate = (campaign.open_count / max(campaign.sent_count, 1)) * 100
    click_rate = (campaign.click_count / max(campaign.sent_count, 1)) * 100
    bounce_rate = (campaign.bounce_count / max(campaign.sent_count, 1)) * 100
    delivery_rate = (campaign.delivered_count / max(campaign.sent_count, 1)) * 100
    
    return CampaignMetricsResponse(
        campaign_id=campaign.id,
        total_recipients=campaign.total_recipients,
        sent_count=campaign.sent_count,
        delivered_count=campaign.delivered_count,
        open_count=campaign.open_count,
        click_count=campaign.click_count,
        bounce_count=campaign.bounce_count,
        unsubscribe_count=campaign.unsubscribe_count,
        spam_count=campaign.spam_count,
        open_rate=round(open_rate, 2),
        click_rate=round(click_rate, 2),
        bounce_rate=round(bounce_rate, 2),
        delivery_rate=round(delivery_rate, 2),
        last_updated=campaign.updated_at
    )



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
