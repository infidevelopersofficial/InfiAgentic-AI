from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
import hashlib
import secrets

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from sqlalchemy import select

# Password hashing with secure config
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
    pbkdf2_sha256__rounds=29000
)

# JWT Bearer
security = HTTPBearer()

# In-memory fallback for token blacklist (used if Redis is unavailable)
_token_blacklist: set = set()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


def _get_token_hash(token: str) -> str:
    """Generate hash of token for blacklist storage (saves memory)"""
    return hashlib.sha256(token.encode()).hexdigest()[:16]


async def blacklist_token(token: str) -> None:
    """Add token to blacklist (uses Redis if available, falls back to in-memory)"""
    token_hash = _get_token_hash(token)
    
    # Try Redis first
    try:
        from app.core.redis_client import TokenBlacklist
        success = await TokenBlacklist.add(token_hash)
        if success:
            return
    except Exception:
        pass  # Fall back to in-memory
    
    # Fallback to in-memory
    _token_blacklist.add(token_hash)


async def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted (uses Redis if available, falls back to in-memory)"""
    token_hash = _get_token_hash(token)
    
    # Try Redis first
    try:
        from app.core.redis_client import TokenBlacklist
        is_blacklisted = await TokenBlacklist.is_blacklisted(token_hash)
        if is_blacklisted:
            return True
    except Exception:
        pass  # Fall back to in-memory
    
    # Fallback to in-memory
    return token_hash in _token_blacklist


def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    jti = secrets.token_urlsafe(16)
    to_encode.update({
        "exp": expire,
        "type": "access",
        "jti": jti,
        "iat": datetime.now(timezone.utc)
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    jti = secrets.token_urlsafe(16)
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "jti": jti,
        "iat": datetime.now(timezone.utc)
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def decode_token(token: str) -> Dict:
    """Decode and verify JWT token"""
    if await is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked"
        )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


async def verify_refresh_token(token: str) -> Dict:
    """Verify refresh token and return payload"""
    payload = await decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type - expected refresh token"
        )
    return payload


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = await decode_token(token)
    
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def require_role(allowed_roles: list[str]):
    """Dependency to require specific roles"""
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker
