from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime, date

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()


# Event model (using a simple table structure)
# In production, this might be a separate model or aggregated from content/social/email
class CalendarEvent(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    event_type: str  # content, social, email, meeting, reminder
    start_time: datetime
    end_time: Optional[datetime] = None
    all_day: bool = False
    location: Optional[str] = None
    metadata: dict = {}
    created_at: datetime
    
    model_config = {"from_attributes": True}


# Schemas
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str = "reminder"
    start_time: datetime
    end_time: Optional[datetime] = None
    all_day: bool = False
    location: Optional[str] = None
    metadata: dict = {}


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: Optional[bool] = None
    location: Optional[str] = None
    metadata: Optional[dict] = None


class EventResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    event_type: str
    start_time: datetime
    end_time: Optional[datetime]
    all_day: bool
    location: Optional[str]
    metadata: dict
    created_at: datetime
    
    model_config = {"from_attributes": True}


class EventList(BaseModel):
    items: List[EventResponse]
    total: int
    page: int
    limit: int


# For now, we'll use a simple in-memory store or aggregate from existing models
# In production, you'd create a proper CalendarEvent model
_events_store: dict = {}


@router.get("/events", response_model=EventList)
async def list_events(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    event_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List calendar events with date range filters"""
    # In production, this would query from a CalendarEvent table
    # For now, we aggregate from content, social posts, and email campaigns
    
    from app.models.content import Content
    from app.models.social import SocialPost
    from app.models.email import EmailCampaign
    
    events: List[EventResponse] = []
    
    # Get scheduled content
    content_query = select(Content).where(
        Content.org_id == current_user.org_id,
        Content.scheduled_for.isnot(None)
    )
    if start_date:
        content_query = content_query.where(Content.scheduled_for >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        content_query = content_query.where(Content.scheduled_for <= datetime.combine(end_date, datetime.max.time()))
    
    content_result = await db.execute(content_query)
    contents = content_result.scalars().all()
    
    for content in contents:
        if content.scheduled_for:
            events.append(EventResponse(
                id=content.id,
                title=content.title or f"Content: {content.id}",
                description=f"Content scheduled for publication",
                event_type="content",
                start_time=content.scheduled_for,
                end_time=None,
                all_day=False,
                location=None,
                metadata={"content_id": str(content.id), "status": content.status},
                created_at=content.created_at
            ))
    
    # Get scheduled social posts
    social_query = select(SocialPost).where(
        SocialPost.org_id == current_user.org_id,
        SocialPost.scheduled_at.isnot(None)
    )
    if start_date:
        social_query = social_query.where(SocialPost.scheduled_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        social_query = social_query.where(SocialPost.scheduled_at <= datetime.combine(end_date, datetime.max.time()))
    
    social_result = await db.execute(social_query)
    posts = social_result.scalars().all()
    
    for post in posts:
        if post.scheduled_at:
            events.append(EventResponse(
                id=post.id,
                title=f"Social Post: {post.platform}",
                description=post.post_text[:100] if post.post_text else "Social media post",
                event_type="social",
                start_time=post.scheduled_at,
                end_time=None,
                all_day=False,
                location=None,
                metadata={"post_id": str(post.id), "platform": post.platform, "status": post.status},
                created_at=post.created_at
            ))
    
    # Get scheduled email campaigns
    email_query = select(EmailCampaign).where(
        EmailCampaign.org_id == current_user.org_id,
        EmailCampaign.scheduled_at.isnot(None)
    )
    if start_date:
        email_query = email_query.where(EmailCampaign.scheduled_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        email_query = email_query.where(EmailCampaign.scheduled_at <= datetime.combine(end_date, datetime.max.time()))
    
    email_result = await db.execute(email_query)
    campaigns = email_result.scalars().all()
    
    for campaign in campaigns:
        if campaign.scheduled_at:
            events.append(EventResponse(
                id=campaign.id,
                title=campaign.name,
                description=f"Email campaign: {campaign.subject}",
                event_type="email",
                start_time=campaign.scheduled_at,
                end_time=None,
                all_day=False,
                location=None,
                metadata={"campaign_id": str(campaign.id), "status": campaign.status},
                created_at=campaign.created_at
            ))
    
    # Filter by event type if provided
    if event_type:
        events = [e for e in events if e.event_type == event_type]
    
    # Sort by start_time
    events.sort(key=lambda x: x.start_time)
    
    # Paginate
    total = len(events)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_events = events[start_idx:end_idx]
    
    return EventList(
        items=paginated_events,
        total=total,
        page=page,
        limit=limit
    )


@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new calendar event"""
    # In production, this would create a CalendarEvent record
    # For now, we'll store it in a simple way or create a reminder
    import uuid
    
    event = EventResponse(
        id=uuid.uuid4(),
        title=event_data.title,
        description=event_data.description,
        event_type=event_data.event_type,
        start_time=event_data.start_time,
        end_time=event_data.end_time,
        all_day=event_data.all_day,
        location=event_data.location,
        metadata=event_data.metadata,
        created_at=datetime.utcnow()
    )
    
    # Store in memory (in production, save to database)
    _events_store[str(event.id)] = {
        "org_id": str(current_user.org_id),
        "user_id": str(current_user.id),
        **event.model_dump()
    }
    
    return event


@router.patch("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: UUID,
    event_data: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update calendar event"""
    # In production, this would update a CalendarEvent record
    event_key = str(event_id)
    if event_key not in _events_store:
        raise HTTPException(status_code=404, detail="Event not found")
    
    stored_event = _events_store[event_key]
    if stored_event["org_id"] != str(current_user.org_id):
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event_data.model_dump(exclude_unset=True)
    stored_event.update(update_data)
    
    return EventResponse(**stored_event)


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete calendar event"""
    # In production, this would delete a CalendarEvent record
    event_key = str(event_id)
    if event_key not in _events_store:
        raise HTTPException(status_code=404, detail="Event not found")
    
    stored_event = _events_store[event_key]
    if stored_event["org_id"] != str(current_user.org_id):
        raise HTTPException(status_code=404, detail="Event not found")
    
    del _events_store[event_key]

