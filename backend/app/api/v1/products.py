from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import Product

router = APIRouter()


# Schemas
class ProductCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    category: Optional[str] = None
    price: Optional[Decimal] = None
    currency: str = "INR"
    features: List[str] = []
    target_audience: dict = {}
    brand_voice: Optional[str] = None
    keywords: List[str] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    features: Optional[List[str]] = None
    brand_voice: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    logo_url: Optional[str]
    website_url: Optional[str]
    category: Optional[str]
    price: Optional[Decimal]
    currency: str
    features: List[str]
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ProductList(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    limit: int


# Routes
@router.get("/", response_model=ProductList)
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List products"""
    query = select(Product).where(Product.org_id == current_user.org_id)
    
    if category:
        query = query.where(Product.category == category)
    
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    query = query.order_by(Product.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return ProductList(
        items=[ProductResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit
    )


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create product"""
    # Check slug uniqueness
    result = await db.execute(
        select(Product).where(
            Product.org_id == current_user.org_id,
            Product.slug == product_data.slug
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Product slug already exists")
    
    product = Product(
        org_id=current_user.org_id,
        **product_data.model_dump()
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return ProductResponse.model_validate(product)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get product by ID"""
    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.org_id == current_user.org_id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(product)


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update product"""
    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.org_id == current_user.org_id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete product"""
    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.org_id == current_user.org_id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(product)
    await db.commit()
