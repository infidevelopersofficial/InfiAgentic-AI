"""
Redis client for caching and token blacklist
"""
try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None

from typing import Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Global Redis connection pool
_redis_client = None


async def get_redis():
    """Get Redis client instance"""
    global _redis_client
    
    if not REDIS_AVAILABLE:
        return None
    
    if _redis_client is None:
        try:
            _redis_client = await redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=settings.REDIS_MAX_CONNECTIONS
            )
            # Test connection
            await _redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Using in-memory fallback.")
            # Return None if Redis is not available
            # The app should still work without Redis (using in-memory fallback)
            return None
    
    return _redis_client


async def close_redis():
    """Close Redis connection"""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
        logger.info("Redis connection closed")


class TokenBlacklist:
    """Token blacklist using Redis"""
    
    BLACKLIST_PREFIX = "blacklist:token:"
    TTL_SECONDS = 86400  # 24 hours
    
    @staticmethod
    def _get_key(token_hash: str) -> str:
        """Get Redis key for token hash"""
        return f"{TokenBlacklist.BLACKLIST_PREFIX}{token_hash}"
    
    @staticmethod
    async def add(token_hash: str) -> bool:
        """Add token to blacklist"""
        redis_client = await get_redis()
        if not redis_client:
            return False
        
        try:
            key = TokenBlacklist._get_key(token_hash)
            await redis_client.setex(key, TokenBlacklist.TTL_SECONDS, "1")
            return True
        except Exception as e:
            logger.error(f"Failed to blacklist token: {e}")
            return False
    
    @staticmethod
    async def is_blacklisted(token_hash: str) -> bool:
        """Check if token is blacklisted"""
        redis_client = await get_redis()
        if not redis_client:
            return False
        
        try:
            key = TokenBlacklist._get_key(token_hash)
            result = await redis_client.exists(key)
            return result > 0
        except Exception as e:
            logger.error(f"Failed to check token blacklist: {e}")
            return False
    
    @staticmethod
    async def remove(token_hash: str) -> bool:
        """Remove token from blacklist (for testing/debugging)"""
        redis_client = await get_redis()
        if not redis_client:
            return False
        
        try:
            key = TokenBlacklist._get_key(token_hash)
            await redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Failed to remove token from blacklist: {e}")
            return False

