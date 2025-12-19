from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base, GUID


class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(GUID(), ForeignKey("products.id", ondelete="SET NULL"))
    assigned_to = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"))
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    first_name = Column(String(100))
    last_name = Column(String(100))
    company = Column(String(255))
    job_title = Column(String(100))
    source = Column(String(50))  # website, social, referral, ad, event
    source_details = Column(JSON, default={})
    status = Column(String(20), default="new")  # new, contacted, qualified, nurturing, converted, lost
    score = Column(Integer, default=0)  # Lead score 0-100
    tags = Column(JSON, default=[])
    custom_fields = Column(JSON, default={})
    last_activity_at = Column(DateTime(timezone=True))
    converted_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    actions = relationship("LeadAction", back_populates="lead")


class LeadAction(Base):
    __tablename__ = "lead_actions"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    lead_id = Column(GUID(), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"))
    action_type = Column(String(50), nullable=False)  # email_sent, call, meeting, note, status_change
    description = Column(Text)
    meta = Column("metadata", JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    lead = relationship("Lead", back_populates="actions")


class LeadFlow(Base):
    __tablename__ = "lead_flows"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(GUID(), ForeignKey("products.id", ondelete="SET NULL"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    trigger_type = Column(String(50), nullable=False)  # form_submit, page_visit, score_threshold, manual
    trigger_conditions = Column(JSON, default={})
    steps = Column(JSON, default=[])  # Workflow steps
    is_active = Column(Boolean, default=True)
    total_leads = Column(Integer, default=0)
    conversion_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    lead_id = Column(GUID(), ForeignKey("leads.id", ondelete="SET NULL"))
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    first_name = Column(String(100))
    last_name = Column(String(100))
    company = Column(String(255))
    job_title = Column(String(100))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    postal_code = Column(String(20))
    tags = Column(JSON, default=[])
    custom_fields = Column(JSON, default={})
    is_subscribed = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    deals = relationship("Deal", back_populates="contact")


class Deal(Base):
    __tablename__ = "deals"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    contact_id = Column(GUID(), ForeignKey("contacts.id", ondelete="SET NULL"))
    product_id = Column(GUID(), ForeignKey("products.id", ondelete="SET NULL"))
    assigned_to = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"))
    name = Column(String(255), nullable=False)
    value = Column(Numeric(12, 2))
    currency = Column(String(3), default="INR")
    stage = Column(String(50), default="prospecting")  # prospecting, qualification, proposal, negotiation, closed_won, closed_lost
    probability = Column(Integer, default=0)
    expected_close_date = Column(DateTime(timezone=True))
    actual_close_date = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    contact = relationship("Contact", back_populates="deals")
