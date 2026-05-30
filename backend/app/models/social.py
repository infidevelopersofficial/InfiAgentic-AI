from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base, GUID


class SocialAccount(Base):
    __tablename__ = "social_accounts"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(50), nullable=False)  # twitter, facebook, instagram, linkedin
    account_id = Column(String(255), nullable=False)
    account_name = Column(String(255))
    access_token = Column(Text)  # Encrypted in production
    refresh_token = Column(Text)
    token_expires_at = Column(DateTime(timezone=True))
    profile_url = Column(String)
    avatar_url = Column(String)
    follower_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    last_synced_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    posts = relationship("SocialPost", back_populates="account")


class SocialPost(Base):
    __tablename__ = "social_posts"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(GUID(), ForeignKey("social_accounts.id", ondelete="CASCADE"), nullable=False)
    content_id = Column(GUID(), ForeignKey("content.id", ondelete="SET NULL"))
    platform = Column(String(50), nullable=False)
    post_text = Column(Text, nullable=False)
    media_urls = Column(JSON, default=[])
    hashtags = Column(JSON, default=[])
    external_post_id = Column(String(255))  # Platform's post ID
    post_url = Column(String)
    status = Column(String(20), default="draft")  # draft, scheduled, published, failed
    scheduled_at = Column(DateTime(timezone=True))
    published_at = Column(DateTime(timezone=True))
    # Engagement metrics
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    engagement_rate = Column(String(10))
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    account = relationship("SocialAccount", back_populates="posts")
