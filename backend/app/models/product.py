from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Numeric, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base, GUID


class Product(Base):
    __tablename__ = "products"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False)
    description = Column(Text)
    logo_url = Column(String)
    website_url = Column(String)
    category = Column(String(100))
    price = Column(Numeric(10, 2))
    currency = Column(String(3), default="INR")
    features = Column(JSON, default=[])
    target_audience = Column(JSON, default={})
    brand_voice = Column(Text)
    keywords = Column(JSON, default=[])
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    content = relationship("Content", back_populates="product")
