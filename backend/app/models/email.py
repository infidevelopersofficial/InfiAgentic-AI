from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class EmailTemplate(Base):
    __tablename__ = "email_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    html_body = Column(Text, nullable=False)
    plain_body = Column(Text)
    template_type = Column(String(50))  # promotional, transactional, newsletter, drip
    variables = Column(JSON, default=[])  # Available merge variables
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class EmailCampaign(Base):
    __tablename__ = "email_campaigns"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("email_templates.id", ondelete="SET NULL"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"))
    name = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    from_name = Column(String(100))
    from_email = Column(String(255))
    reply_to = Column(String(255))
    html_body = Column(Text, nullable=False)
    plain_body = Column(Text)
    status = Column(String(20), default="draft")  # draft, scheduled, sending, sent, paused
    audience_filter = Column(JSON, default={})
    scheduled_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))
    # Metrics
    total_recipients = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    open_count = Column(Integer, default=0)
    click_count = Column(Integer, default=0)
    bounce_count = Column(Integer, default=0)
    unsubscribe_count = Column(Integer, default=0)
    spam_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class EmailAutomation(Base):
    __tablename__ = "email_automations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    trigger_type = Column(String(50), nullable=False)  # signup, purchase, abandoned_cart, custom
    trigger_conditions = Column(JSON, default={})
    email_sequence = Column(JSON, default=[])  # Array of {template_id, delay_days, delay_hours}
    is_active = Column(Boolean, default=True)
    total_enrolled = Column(Integer, default=0)
    total_completed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
