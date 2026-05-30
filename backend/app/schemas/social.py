"""
Pydantic schemas for social media endpoints.
Comprehensive validation for accounts, posts, and analytics.
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID
from enum import Enum


class PlatformEnum(str, Enum):
    """Supported social platforms"""
    twitter = "twitter"
    linkedin = "linkedin"
    facebook = "facebook"
    instagram = "instagram"


class PostStatusEnum(str, Enum):
    """Post status values"""
    draft = "draft"
    scheduled = "scheduled"
    published = "published"
    failed = "failed"
    archived = "archived"


# ============================================================================
# ACCOUNT SCHEMAS
# ============================================================================

class SocialAccountConnect(BaseModel):
    """Request to connect a social media account"""
    platform: PlatformEnum
    access_token: str = Field(..., min_length=10, description="Platform access token")
    refresh_token: Optional[str] = Field(None, description="Optional refresh token")
    account_id: Optional[str] = Field(None, description="Platform-specific account ID")
    
    @field_validator("platform")
    def validate_platform(cls, v):
        """Validate platform is supported"""
        if v not in [p.value for p in PlatformEnum]:
            raise ValueError(f"Unsupported platform: {v}")
        return v


class SocialAccountResponse(BaseModel):
    """Connected social account info"""
    id: UUID
    platform: str
    account_id: str
    account_name: Optional[str] = None
    profile_url: Optional[str] = None
    avatar_url: Optional[str] = None
    follower_count: int = 0
    is_active: bool = True
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class SocialAccountList(BaseModel):
    """List of social accounts"""
    items: List[SocialAccountResponse]
    total: int


# ============================================================================
# POST SCHEMAS
# ============================================================================

class SocialPostCreate(BaseModel):
    """Create a new social post"""
    account_id: UUID
    post_text: str = Field(..., min_length=1, max_length=5000)
    media_urls: List[str] = Field(default=[], max_length=10)
    hashtags: List[str] = Field(default=[], max_length=30)
    content_id: Optional[UUID] = Field(None, description="Link to content item")
    scheduled_at: Optional[datetime] = Field(None, description="ISO format datetime for scheduling")
    
    @field_validator("post_text")
    def validate_text_not_empty(cls, v):
        """Ensure post text is not empty"""
        if not v.strip():
            raise ValueError("Post text cannot be empty")
        return v.strip()
    
    @field_validator("media_urls")
    def validate_media_urls(cls, v):
        """Validate media URLs format"""
        for url in v:
            if not url.startswith(("http://", "https://")):
                raise ValueError(f"Invalid URL format: {url}")
        return v


class SocialPostUpdate(BaseModel):
    """Update an existing social post"""
    post_text: Optional[str] = Field(None, min_length=1, max_length=5000)
    media_urls: Optional[List[str]] = Field(None, max_length=10)
    hashtags: Optional[List[str]] = Field(None, max_length=30)
    scheduled_at: Optional[datetime] = None
    status: Optional[PostStatusEnum] = None
    
    @field_validator("post_text")
    def validate_text_not_empty(cls, v):
        """Ensure post text is not empty if provided"""
        if v is not None and not v.strip():
            raise ValueError("Post text cannot be empty")
        return v.strip() if v else None


class SocialPostResponse(BaseModel):
    """Social post details"""
    id: UUID
    account_id: UUID
    platform: str
    post_text: str
    media_urls: List[str] = []
    hashtags: List[str] = []
    status: str
    external_post_id: Optional[str] = None
    post_url: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    # Engagement metrics
    likes: int = 0
    comments: int = 0
    shares: int = 0
    impressions: int = 0
    reach: int = 0
    engagement_rate: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class SocialPostList(BaseModel):
    """Paginated list of social posts"""
    items: List[SocialPostResponse]
    total: int
    page: int
    limit: int


class BulkPublishRequest(BaseModel):
    """Publish multiple posts"""
    post_ids: List[UUID] = Field(..., min_items=1, max_items=100)


class BulkPublishResponse(BaseModel):
    """Response from bulk publish"""
    published: int
    failed: int
    results: Dict[str, Dict] = Field(default_factory=dict)


# ============================================================================
# ANALYTICS SCHEMAS
# ============================================================================

class PostMetricsResponse(BaseModel):
    """Metrics for a single post"""
    post_id: UUID
    platform: str
    likes: int
    comments: int
    shares: int
    impressions: int
    reach: int
    engagement_rate: float
    click_through_rate: Optional[float] = None
    last_updated: datetime


class PlatformAnalyticsResponse(BaseModel):
    """Analytics for a platform"""
    platform: str
    total_posts: int
    published_posts: int
    scheduled_posts: int
    failed_posts: int
    total_engagement: int
    total_impressions: int
    total_reach: int
    avg_engagement_rate: float
    top_post: Optional[PostMetricsResponse] = None
    last_synced: Optional[datetime] = None


class AggregatedAnalyticsResponse(BaseModel):
    """Aggregated analytics across all platforms"""
    total_posts: int
    published_posts: int
    scheduled_posts: int
    failed_posts: int
    total_engagement: int
    total_impressions: int
    total_reach: int
    avg_engagement_rate: float
    platforms: Dict[str, PlatformAnalyticsResponse]
    date_range_start: datetime
    date_range_end: datetime
    last_synced: Optional[datetime] = None


# ============================================================================
# SCHEDULING SCHEMAS
# ============================================================================

class PostScheduleRequest(BaseModel):
    """Schedule a post for later publishing"""
    scheduled_at: datetime = Field(..., description="ISO format datetime")
    
    @field_validator("scheduled_at")
    def validate_future_date(cls, v):
        """Ensure scheduled time is in the future"""
        if v <= datetime.utcnow():
            raise ValueError("Scheduled time must be in the future")
        return v


class ScheduledPostsResponse(BaseModel):
    """Upcoming scheduled posts"""
    posts: List[SocialPostResponse]
    total: int
    next_publish_in_minutes: Optional[int] = None


# ============================================================================
# PLATFORM CONNECTION SCHEMAS
# ============================================================================

class TwitterOAuthCallback(BaseModel):
    """Twitter OAuth callback data"""
    code: str
    state: str
    oauth_token: Optional[str] = None
    oauth_verifier: Optional[str] = None


class LinkedInOAuthCallback(BaseModel):
    """LinkedIn OAuth callback data"""
    code: str
    state: str


class PlatformDisconnect(BaseModel):
    """Disconnect a social account"""
    account_id: UUID
    keep_posts: bool = Field(default=False, description="Keep posts if disconnecting")
