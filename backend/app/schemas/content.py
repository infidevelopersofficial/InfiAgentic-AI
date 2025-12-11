from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ContentBase(BaseModel):
    title: str = Field(..., max_length=500)
    content_type: str = Field(..., max_length=50)
    body: str
    meta_description: Optional[str] = Field(None, max_length=300)
    keywords: List[str] = []
    tone: Optional[str] = None
    target_audience: Optional[str] = None


class ContentCreate(ContentBase):
    product_id: Optional[UUID] = None


class ContentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    body: Optional[str] = None
    meta_description: Optional[str] = Field(None, max_length=300)
    keywords: Optional[List[str]] = None
    tone: Optional[str] = None
    target_audience: Optional[str] = None
    status: Optional[str] = None


class ContentResponse(ContentBase):
    id: UUID
    org_id: UUID
    product_id: Optional[UUID] = None
    created_by: Optional[UUID] = None
    status: str
    ai_generated: bool
    quality_score: Optional[int] = None
    revision_count: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class ContentList(BaseModel):
    items: List[ContentResponse]
    total: int
    page: int
    limit: int
