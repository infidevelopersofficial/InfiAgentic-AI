"""
Social Media API endpoints for scheduling posts and managing social accounts.
Supports Twitter, LinkedIn, Facebook, and Instagram.
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
from app.models.social import SocialAccount, SocialPost
from app.schemas.social import (
    SocialAccountConnect,
    SocialAccountResponse,
    SocialAccountList,
    SocialPostCreate,
    SocialPostUpdate,
    SocialPostResponse,
    SocialPostList,
    PostScheduleRequest,
    AggregatedAnalyticsResponse,
    PlatformAnalyticsResponse,
    PostMetricsResponse,
    BulkPublishRequest,
    BulkPublishResponse,
    ScheduledPostsResponse,
)
from app.tasks.social_tasks import publish_social_post, sync_social_metrics

router = APIRouter()
logger = logging.getLogger(__name__)


# ============================================================================
# ACCOUNT MANAGEMENT
# ============================================================================

@router.post("/accounts", response_model=SocialAccountResponse, status_code=status.HTTP_201_CREATED)
async def connect_social_account(
    account_data: SocialAccountConnect,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Connect a social media account (Twitter, LinkedIn, Facebook, Instagram).
    Validates credentials and fetches account info from platform.
    """
    try:
        # Check if account already connected
        result = await db.execute(
            select(SocialAccount).where(
                and_(
                    SocialAccount.org_id == current_user.org_id,
                    SocialAccount.platform == account_data.platform,
                    SocialAccount.account_id == account_data.account_id or SocialAccount.account_id.is_(None)
                )
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Account already connected for {account_data.platform}"
            )
        
        # Create account record
        account = SocialAccount(
            org_id=current_user.org_id,
            platform=account_data.platform,
            account_id=account_data.account_id or f"pending_{UUID()}",
            access_token=account_data.access_token,
            refresh_token=account_data.refresh_token,
            is_active=True
        )
        
        db.add(account)
        await db.commit()
        await db.refresh(account)
        
        # Fetch and sync account info asynchronously
        background_tasks.add_task(
            sync_social_metrics,
            str(account.id),
            account_data.platform
        )
        
        logger.info(f"Connected {account_data.platform} account for org {current_user.org_id}")
        return SocialAccountResponse.model_validate(account)
        
    except Exception as e:
        logger.error(f"Failed to connect social account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to connect account: {str(e)}"
        )


@router.get("/accounts", response_model=SocialAccountList)
async def list_social_accounts(
    platform: Optional[str] = Query(None, description="Filter by platform"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all connected social accounts for organization"""
    query = select(SocialAccount).where(SocialAccount.org_id == current_user.org_id)
    
    if platform:
        query = query.where(SocialAccount.platform == platform)
    if is_active is not None:
        query = query.where(SocialAccount.is_active == is_active)
    
    # Get total count
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # Get accounts ordered by creation date
    result = await db.execute(query.order_by(SocialAccount.created_at.desc()))
    accounts = result.scalars().all()
    
    return SocialAccountList(
        items=[SocialAccountResponse.model_validate(acc) for acc in accounts],
        total=total
    )


@router.get("/accounts/{account_id}", response_model=SocialAccountResponse)
async def get_social_account(
    account_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get details of a specific social account"""
    result = await db.execute(
        select(SocialAccount).where(
            and_(
                SocialAccount.id == account_id,
                SocialAccount.org_id == current_user.org_id
            )
        )
    )
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")
    
    return SocialAccountResponse.model_validate(account)


@router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect_social_account(
    account_id: UUID,
    delete_posts: bool = Query(False, description="Delete all posts from this account"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Disconnect a social media account"""
    result = await db.execute(
        select(SocialAccount).where(
            and_(
                SocialAccount.id == account_id,
                SocialAccount.org_id == current_user.org_id
            )
        )
    )
    account = result.scalar_one_or_none()
    
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")
    
    # Delete posts if requested
    if delete_posts:
        await db.execute(delete(SocialPost).where(SocialPost.account_id == account_id))
    
    # Delete account
    await db.delete(account)
    await db.commit()
    
    logger.info(f"Disconnected {account.platform} account {account_id}")


# ============================================================================
# POST MANAGEMENT
# ============================================================================

@router.post("/posts", response_model=SocialPostResponse, status_code=status.HTTP_201_CREATED)
async def create_social_post(
    post_data: SocialPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Create a new social post (draft or scheduled).
    If scheduled_at is provided, post will be published at that time via Celery.
    """
    # Verify account exists and belongs to org
    result = await db.execute(
        select(SocialAccount).where(
            and_(
                SocialAccount.id == post_data.account_id,
                SocialAccount.org_id == current_user.org_id,
                SocialAccount.is_active == True
            )
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found or inactive")
    
    # Validate post length for platform
    if account.platform == "twitter" and len(post_data.post_text) > 280:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Twitter posts must be 280 characters or less"
        )
    
    # Create post
    post = SocialPost(
        org_id=current_user.org_id,
        account_id=post_data.account_id,
        content_id=post_data.content_id,
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
    
    # Schedule publishing if scheduled_at provided
    if post_data.scheduled_at:
        delay_seconds = int((post_data.scheduled_at - datetime.utcnow()).total_seconds())
        if delay_seconds > 0:
            background_tasks.add_task(
                publish_social_post.apply_async,
                args=(str(post.id), account.platform, str(account.id)),
                countdown=delay_seconds
            )
            logger.info(f"Post {post.id} scheduled for publishing in {delay_seconds} seconds")
    
    return SocialPostResponse.model_validate(post)


@router.get("/posts", response_model=SocialPostList)
async def list_social_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    platform: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    account_id: Optional[UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List social posts with filtering and pagination.
    """
    query = select(SocialPost).where(SocialPost.org_id == current_user.org_id)
    
    # Apply filters
    if platform:
        query = query.where(SocialPost.platform == platform)
    if status:
        query = query.where(SocialPost.status == status)
    if account_id:
        query = query.where(SocialPost.account_id == account_id)
    
    # Count total
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # Paginate and order
    query = query.order_by(SocialPost.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return SocialPostList(
        items=[SocialPostResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.get("/posts/{post_id}", response_model=SocialPostResponse)
async def get_social_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get details of a specific social post"""
    result = await db.execute(
        select(SocialPost).where(
            and_(
                SocialPost.id == post_id,
                SocialPost.org_id == current_user.org_id
            )
        )
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Social post not found")
    
    return SocialPostResponse.model_validate(post)


@router.patch("/posts/{post_id}", response_model=SocialPostResponse)
async def update_social_post(
    post_id: UUID,
    post_data: SocialPostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a social post (draft or scheduled only).
    Cannot update published posts.
    """
    result = await db.execute(
        select(SocialPost).where(
            and_(
                SocialPost.id == post_id,
                SocialPost.org_id == current_user.org_id
            )
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Social post not found")
    
    if post.status == "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update published posts"
        )
    
    # Update allowed fields
    update_data = post_data.model_dump(exclude_unset=True, exclude_none=True)
    for field, value in update_data.items():
        if field == "status" and value == "published":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Use /posts/{id}/publish endpoint to publish"
            )
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
    """Delete a social post (draft or scheduled only)"""
    result = await db.execute(
        select(SocialPost).where(
            and_(
                SocialPost.id == post_id,
                SocialPost.org_id == current_user.org_id
            )
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Social post not found")
    
    if post.status == "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete published posts"
        )
    
    await db.delete(post)
    await db.commit()
    logger.info(f"Deleted social post {post_id}")


# ============================================================================
# PUBLISHING
# ============================================================================

@router.post("/posts/{post_id}/publish", response_model=SocialPostResponse)
async def publish_social_post_now(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Publish a post immediately"""
    result = await db.execute(
        select(SocialPost).where(
            and_(
                SocialPost.id == post_id,
                SocialPost.org_id == current_user.org_id
            )
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Social post not found")
    
    if post.status == "published":
        raise HTTPException(status_code=400, detail="Post already published")
    
    if post.status == "failed":
        raise HTTPException(status_code=400, detail="Cannot republish failed posts")
    
    # Mark as published and schedule async task
    post.status = "published"
    post.published_at = datetime.utcnow()
    await db.commit()
    await db.refresh(post)
    
    # Queue publishing task
    background_tasks.add_task(
        publish_social_post.delay,
        str(post.id),
        post.platform,
        str(post.account_id)
    )
    
    logger.info(f"Post {post_id} queued for publishing on {post.platform}")
    return SocialPostResponse.model_validate(post)


@router.post("/posts/bulk/publish", response_model=BulkPublishResponse)
async def bulk_publish_posts(
    request: BulkPublishRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Publish multiple posts at once"""
    result = await db.execute(
        select(SocialPost).where(
            and_(
                SocialPost.id.in_(request.post_ids),
                SocialPost.org_id == current_user.org_id,
                SocialPost.status != "published"
            )
        )
    )
    posts = result.scalars().all()
    
    if not posts:
        raise HTTPException(status_code=404, detail="No unpublished posts found")
    
    published = 0
    failed = 0
    results = {}
    
    for post in posts:
        try:
            post.status = "published"
            post.published_at = datetime.utcnow()
            
            # Queue task
            background_tasks.add_task(
                publish_social_post.delay,
                str(post.id),
                post.platform,
                str(post.account_id)
            )
            
            published += 1
            results[str(post.id)] = {"status": "queued"}
        except Exception as e:
            failed += 1
            results[str(post.id)] = {"status": "failed", "error": str(e)}
    
    await db.commit()
    logger.info(f"Bulk published {published} posts, {failed} failed")
    
    return BulkPublishResponse(
        published=published,
        failed=failed,
        results=results
    )


# ============================================================================
# ANALYTICS
# ============================================================================

@router.get("/analytics", response_model=AggregatedAnalyticsResponse)
async def get_aggregated_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to include"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get aggregated analytics across all platforms"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Get all posts for this period
    result = await db.execute(
        select(SocialPost).where(
            and_(
                SocialPost.org_id == current_user.org_id,
                SocialPost.created_at >= cutoff_date
            )
        )
    )
    posts = result.scalars().all()
    
    # Aggregate data
    platforms_data: Dict[str, Dict] = {}
    total_engagement = 0
    total_impressions = 0
    total_reach = 0
    
    for post in posts:
        platform = post.platform
        if platform not in platforms_data:
            platforms_data[platform] = {
                "total_posts": 0,
                "published_posts": 0,
                "scheduled_posts": 0,
                "failed_posts": 0,
                "total_engagement": 0,
                "total_impressions": 0,
                "total_reach": 0,
                "posts": []
            }
        
        platforms_data[platform]["total_posts"] += 1
        if post.status == "published":
            platforms_data[platform]["published_posts"] += 1
        elif post.status == "scheduled":
            platforms_data[platform]["scheduled_posts"] += 1
        elif post.status == "failed":
            platforms_data[platform]["failed_posts"] += 1
        
        engagement = post.likes + post.comments + post.shares
        platforms_data[platform]["total_engagement"] += engagement
        platforms_data[platform]["total_impressions"] += post.impressions
        platforms_data[platform]["total_reach"] += post.reach
        platforms_data[platform]["posts"].append(post)
        
        total_engagement += engagement
        total_impressions += post.impressions
        total_reach += post.reach
    
    # Build platform responses
    platform_responses = {}
    for platform, data in platforms_data.items():
        posts_list = sorted(data["posts"], key=lambda p: p.likes + p.comments + p.shares, reverse=True)
        top_post = None
        if posts_list:
            p = posts_list[0]
            engagement_rate = ((p.likes + p.comments + p.shares) / max(p.impressions, 1)) * 100
            top_post = PostMetricsResponse(
                post_id=p.id,
                platform=p.platform,
                likes=p.likes,
                comments=p.comments,
                shares=p.shares,
                impressions=p.impressions,
                reach=p.reach,
                engagement_rate=round(engagement_rate, 2),
                last_updated=p.updated_at
            )
        
        avg_engagement = data["total_engagement"] / max(data["total_posts"], 1)
        platform_responses[platform] = PlatformAnalyticsResponse(
            platform=platform,
            total_posts=data["total_posts"],
            published_posts=data["published_posts"],
            scheduled_posts=data["scheduled_posts"],
            failed_posts=data["failed_posts"],
            total_engagement=data["total_engagement"],
            total_impressions=data["total_impressions"],
            total_reach=data["total_reach"],
            avg_engagement_rate=round(avg_engagement, 2),
            top_post=top_post
        )
    
    avg_engagement_rate = total_engagement / max(total_impressions, 1) * 100 if total_impressions > 0 else 0
    
    return AggregatedAnalyticsResponse(
        total_posts=len(posts),
        published_posts=sum(1 for p in posts if p.status == "published"),
        scheduled_posts=sum(1 for p in posts if p.status == "scheduled"),
        failed_posts=sum(1 for p in posts if p.status == "failed"),
        total_engagement=total_engagement,
        total_impressions=total_impressions,
        total_reach=total_reach,
        avg_engagement_rate=round(avg_engagement_rate, 2),
        platforms=platform_responses,
        date_range_start=cutoff_date,
        date_range_end=datetime.utcnow()
    )


@router.get("/analytics/platform/{platform}", response_model=PlatformAnalyticsResponse)
async def get_platform_analytics(
    platform: str,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics for a specific platform"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    result = await db.execute(
        select(SocialPost).where(
            and_(
                SocialPost.org_id == current_user.org_id,
                SocialPost.platform == platform,
                SocialPost.created_at >= cutoff_date
            )
        )
    )
    posts = result.scalars().all()
    
    if not posts:
        raise HTTPException(status_code=404, detail=f"No posts found for {platform}")
    
    # Calculate metrics
    total_engagement = sum(p.likes + p.comments + p.shares for p in posts)
    total_impressions = sum(p.impressions for p in posts)
    total_reach = sum(p.reach for p in posts)
    
    top_post = None
    if posts:
        sorted_posts = sorted(posts, key=lambda p: p.likes + p.comments + p.shares, reverse=True)
        p = sorted_posts[0]
        engagement_rate = ((p.likes + p.comments + p.shares) / max(p.impressions, 1)) * 100
        top_post = PostMetricsResponse(
            post_id=p.id,
            platform=p.platform,
            likes=p.likes,
            comments=p.comments,
            shares=p.shares,
            impressions=p.impressions,
            reach=p.reach,
            engagement_rate=round(engagement_rate, 2),
            last_updated=p.updated_at
        )
    
    avg_engagement = total_engagement / max(len(posts), 1)
    
    return PlatformAnalyticsResponse(
        platform=platform,
        total_posts=len(posts),
        published_posts=sum(1 for p in posts if p.status == "published"),
        scheduled_posts=sum(1 for p in posts if p.status == "scheduled"),
        failed_posts=sum(1 for p in posts if p.status == "failed"),
        total_engagement=total_engagement,
        total_impressions=total_impressions,
        total_reach=total_reach,
        avg_engagement_rate=round(avg_engagement, 2),
        top_post=top_post
    )


# ============================================================================
# SCHEDULING
# ============================================================================

@router.get("/posts/scheduled", response_model=ScheduledPostsResponse)
async def get_scheduled_posts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get upcoming scheduled posts"""
    now = datetime.utcnow()
    
    result = await db.execute(
        select(SocialPost).where(
            and_(
                SocialPost.org_id == current_user.org_id,
                SocialPost.status == "scheduled",
                SocialPost.scheduled_at >= now
            )
        )
    )
    posts = result.scalars().all()
    posts = sorted(posts, key=lambda p: p.scheduled_at)
    
    next_publish_in_minutes = None
    if posts:
        delta = posts[0].scheduled_at - now
        next_publish_in_minutes = int(delta.total_seconds() / 60)
    
    return ScheduledPostsResponse(
        posts=[SocialPostResponse.model_validate(p) for p in posts],
        total=len(posts),
        next_publish_in_minutes=next_publish_in_minutes
    )
