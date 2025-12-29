"""
Middleware for rate limiting, request ID tracking, and error handling
"""
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
import uuid
import logging
from typing import Dict
from collections import defaultdict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Add request ID to all requests"""
    
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    
    def __init__(self, app: ASGIApp, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = defaultdict(list)
        self.cleanup_interval = timedelta(minutes=5)
        self.last_cleanup = datetime.utcnow()
    
    def _cleanup_old_requests(self):
        """Remove old request timestamps"""
        now = datetime.utcnow()
        if (now - self.last_cleanup) < self.cleanup_interval:
            return
        
        cutoff = now - timedelta(minutes=1)
        for client_id in list(self.requests.keys()):
            self.requests[client_id] = [
                ts for ts in self.requests[client_id] if ts > cutoff
            ]
            if not self.requests[client_id]:
                del self.requests[client_id]
        
        self.last_cleanup = now
    
    def _get_client_id(self, request: Request) -> str:
        """Get client identifier for rate limiting"""
        # Use IP address or user ID if authenticated
        client_ip = request.client.host if request.client else "unknown"
        
        # If user is authenticated, use user ID for more accurate rate limiting
        # This would require accessing the user from request state
        # For now, use IP address
        return client_ip
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/ready"]:
            return await call_next(request)
        
        self._cleanup_old_requests()
        
        client_id = self._get_client_id(request)
        now = datetime.utcnow()
        cutoff = now - timedelta(minutes=1)
        
        # Clean old requests for this client
        self.requests[client_id] = [
            ts for ts in self.requests[client_id] if ts > cutoff
        ]
        
        # Check rate limit
        if len(self.requests[client_id]) >= self.requests_per_minute:
            request_id = getattr(request.state, "request_id", "unknown")
            logger.warning(
                f"Rate limit exceeded for client {client_id}",
                extra={"request_id": request_id, "client_id": client_id}
            )
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Please try again later.",
                    "request_id": request_id
                },
                headers={"X-Request-ID": request_id}
            )
        
        # Record this request
        self.requests[client_id].append(now)
        
        return await call_next(request)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Standardize error responses"""
    
    async def dispatch(self, request: Request, call_next):
        request_id = getattr(request.state, "request_id", "unknown")
        
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            logger.error(
                f"Unhandled exception in middleware",
                extra={
                    "request_id": request_id,
                    "path": request.url.path,
                    "method": request.method,
                    "error": str(exc)
                },
                exc_info=True
            )
            
            from app.core.config import settings
            
            return JSONResponse(
                status_code=500,
                content={
                    "detail": str(exc) if settings.DEBUG else "Internal server error",
                    "request_id": request_id
                },
                headers={"X-Request-ID": request_id}
            )


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Only add HSTS in production with HTTPS
        from app.core.config import settings
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests with timing information"""
    
    async def dispatch(self, request: Request, call_next):
        request_id = getattr(request.state, "request_id", "unknown")
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host if request.client else "unknown"
            }
        )
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Response: {request.method} {request.url.path} - {response.status_code}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "process_time": round(process_time, 3)
                }
            )
            
            response.headers["X-Process-Time"] = str(round(process_time, 3))
            return response
        except Exception as exc:
            process_time = time.time() - start_time
            logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "error": str(exc),
                    "process_time": round(process_time, 3)
                },
                exc_info=True
            )
            raise
