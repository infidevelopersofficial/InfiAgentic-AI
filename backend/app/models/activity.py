from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
import uuid

from app.core.database import Base, GUID


class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"))
    activity_type = Column(String(50), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(GUID())
    description = Column(Text)
    meta = Column("metadata", JSON, default={})
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
