from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class OrganizationBase(BaseModel):
    name: str
    slug: str


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationResponse(OrganizationBase):
    id: UUID
    logo_url: Optional[str] = None
    subscription_tier: str
    created_at: datetime
    
    model_config = {"from_attributes": True}


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: list = []


class RoleResponse(RoleBase):
    id: UUID
    org_id: UUID
    is_system: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    org_id: Optional[UUID] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: UUID
    org_id: UUID
    role_id: Optional[UUID] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse
