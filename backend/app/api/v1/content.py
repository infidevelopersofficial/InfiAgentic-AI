from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate, ContentResponse, ContentList

router = APIRouter()


@router.get("/", response_model=ContentList)
async def list_content(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    content_type: Optional[str] = None,
    product_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List content items with pagination and filters"""
    
    query = select(Content).where(Content.org_id == current_user.org_id)
    
    if status:
        query = query.where(Content.status == status)
    if content_type:
        query = query.where(Content.content_type == content_type)
    if product_id:
        query = query.where(Content.product_id == product_id)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar()
    
    # Paginate
    query = query.order_by(Content.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return ContentList(
        items=[ContentResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.post("/", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def create_content(
    content_data: ContentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new content item"""
    
    content = Content(
        **content_data.model_dump(),
        org_id=current_user.org_id,
        created_by=current_user.id
    )
    db.add(content)
    await db.commit()
    await db.refresh(content)
    
    return ContentResponse.model_validate(content)


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get content item by ID"""
    
    result = await db.execute(
        select(Content).where(
            Content.id == content_id,
            Content.org_id == current_user.org_id
        )
    )
    content = result.scalar_one_or_none()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return ContentResponse.model_validate(content)


@router.patch("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: UUID,
    content_data: ContentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update content item"""
    
    result = await db.execute(
        select(Content).where(
            Content.id == content_id,
            Content.org_id == current_user.org_id
        )
    )
    content = result.scalar_one_or_none()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    update_data = content_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)
    
    content.revision_count += 1
    await db.commit()
    await db.refresh(content)
    
    return ContentResponse.model_validate(content)


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete content item"""
    
    result = await db.execute(
        select(Content).where(
            Content.id == content_id,
            Content.org_id == current_user.org_id
        )
    )
    content = result.scalar_one_or_none()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    await db.execute(delete(Content).where(Content.id == content_id))
    await db.commit()
