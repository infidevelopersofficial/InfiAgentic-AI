from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.social import SocialAccount, SocialPost

router = APIRouter()


# Schemas
class SocialAccountResponse(BaseModel):
    id: UUID
    platform: str
    account_name: Optional[str]
    profile_url: Optional[str]
    avatar_url: Optional[str]
    follower_count: int
    is_active: bool
    last_synced_at: Optional[datetime]
    created_at: datetime
    
    model_config = {"from_attributes": True}


class SocialPostCreate(BaseModel):
    account_id: UUID
    post_text: str
    media_urls: List[str] = []
    hashtags: List[str] = []
    scheduled_at: Optional[datetime] = None


class SocialPostResponse(BaseModel):
    id: UUID
    account_id: UUID
    platform: str
    post_text: str
    media_urls: List[str]
    hashtags: List[str]
    status: str
    scheduled_at: Optional[datetime]
    published_at: Optional[datetime]
    likes: int
    comments: int
    shares: int
    impressions: int
    created_at: datetime
    
    model_config = {"from_attributes": True}


class SocialPostList(BaseModel):
    items: List[SocialPostResponse]
    total: int
    page: int
    limit: int


# Routes
@router.get("/accounts", response_model=List[SocialAccountResponse])
async def list_social_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List connected social accounts"""
    result = await db.execute(
        select(SocialAccount).where(SocialAccount.org_id == current_user.org_id)
    )
    accounts = result.scalars().all()
    return [SocialAccountResponse.model_validate(acc) for acc in accounts]


@router.get("/posts", response_model=SocialPostList)
async def list_social_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    platform: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List social posts with filters"""
    query = select(SocialPost).where(SocialPost.org_id == current_user.org_id)
    
    if platform:
        query = query.where(SocialPost.platform == platform)
    if status:
        query = query.where(SocialPost.status == status)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(SocialPost.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return SocialPostList(
        items=[SocialPostResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.post("/posts", response_model=SocialPostResponse, status_code=status.HTTP_201_CREATED)
async def create_social_post(
    post_data: SocialPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new social post"""
    # Verify account belongs to org
    result = await db.execute(
        select(SocialAccount).where(
            SocialAccount.id == post_data.account_id,
            SocialAccount.org_id == current_user.org_id
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")
    
    post = SocialPost(
        org_id=current_user.org_id,
        account_id=post_data.account_id,
        platform=account.platform,
        post_text=post_data.post_text,
        media_urls=post_data.media_urls,
        hashtags=post_data.hashtags,
        scheduled_at=post_data.scheduled_at,
        status="scheduled" if post_data.scheduled_at else "draft"
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    
    return SocialPostResponse.model_validate(post)


class SocialPostUpdate(BaseModel):
    post_text: Optional[str] = None
    media_urls: Optional[List[str]] = None
    hashtags: Optional[List[str]] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None


@router.patch("/posts/{post_id}", response_model=SocialPostResponse)
async def update_social_post(
    post_id: UUID,
    post_data: SocialPostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update social post"""
    result = await db.execute(
        select(SocialPost).where(
            SocialPost.id == post_id,
            SocialPost.org_id == current_user.org_id
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Social post not found")
    
    update_data = post_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)
    
    await db.commit()
    await db.refresh(post)
    return SocialPostResponse.model_validate(post)


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_social_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete social post"""
    result = await db.execute(
        select(SocialPost).where(
            SocialPost.id == post_id,
            SocialPost.org_id == current_user.org_id
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Social post not found")
    
    from app.models.social import SocialPost
    await db.execute(delete(SocialPost).where(SocialPost.id == post_id))
    await db.commit()


@router.post("/posts/{post_id}/publish", response_model=SocialPostResponse)
async def publish_social_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Publish social post immediately"""
    result = await db.execute(
        select(SocialPost).where(
            SocialPost.id == post_id,
            SocialPost.org_id == current_user.org_id
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Social post not found")
    
    if post.status == "published":
        raise HTTPException(status_code=400, detail="Post already published")
    
    post.status = "published"
    post.published_at = datetime.utcnow()
    # In production, this would trigger async publishing via Celery
    await db.commit()
    await db.refresh(post)
    
    return SocialPostResponse.model_validate(post)
