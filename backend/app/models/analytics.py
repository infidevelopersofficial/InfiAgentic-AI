from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Integer, Numeric, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False)
    event_source = Column(String(50))  # content, social, email, crm, agent
    entity_type = Column(String(50))  # content, post, campaign, lead, deal
    entity_id = Column(UUID(as_uuid=True))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    properties = Column(JSON, default={})
    session_id = Column(String(100))
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DailyMetric(Base):
    __tablename__ = "daily_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"))
    date = Column(Date, nullable=False)
    metric_type = Column(String(50), nullable=False)
    # Content metrics
    content_created = Column(Integer, default=0)
    content_published = Column(Integer, default=0)
    content_engagement = Column(Integer, default=0)
    # Social metrics
    social_posts = Column(Integer, default=0)
    social_likes = Column(Integer, default=0)
    social_comments = Column(Integer, default=0)
    social_shares = Column(Integer, default=0)
    social_reach = Column(Integer, default=0)
    # Email metrics
    emails_sent = Column(Integer, default=0)
    emails_opened = Column(Integer, default=0)
    emails_clicked = Column(Integer, default=0)
    email_unsubscribes = Column(Integer, default=0)
    # Lead metrics
    new_leads = Column(Integer, default=0)
    qualified_leads = Column(Integer, default=0)
    converted_leads = Column(Integer, default=0)
    # Revenue metrics
    revenue = Column(Numeric(12, 2), default=0)
    deals_won = Column(Integer, default=0)
    deals_lost = Column(Integer, default=0)
    # Agent metrics
    agent_runs = Column(Integer, default=0)
    agent_success_rate = Column(Numeric(5, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
