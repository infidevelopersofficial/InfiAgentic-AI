from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base, GUID


class Content(Base):
    __tablename__ = "content"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(GUID(), ForeignKey("products.id", ondelete="SET NULL"))
    created_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"))
    title = Column(String(500), nullable=False)
    content_type = Column(String(50), nullable=False)  # blog, social, email, ad_copy, landing_page
    body = Column(Text, nullable=False)
    meta_description = Column(String(300))
    keywords = Column(JSON, default=[])
    tone = Column(String(50))  # professional, casual, humorous, etc.
    target_audience = Column(String(100))
    status = Column(String(20), default="draft")  # draft, pending_review, approved, published, archived
    ai_generated = Column(Boolean, default=False)
    ai_model_used = Column(String(50))
    ai_prompt_used = Column(Text)
    quality_score = Column(Integer)  # AI quality rating 1-100
    revision_count = Column(Integer, default=0)
    published_at = Column(DateTime(timezone=True))
    scheduled_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="content")
    approvals = relationship("ContentApproval", back_populates="content")


class ContentApproval(Base):
    __tablename__ = "content_approvals"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    content_id = Column(GUID(), ForeignKey("content.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"))
    status = Column(String(20), nullable=False)  # approved, rejected, revision_requested
    feedback = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    content = relationship("Content", back_populates="approvals")
