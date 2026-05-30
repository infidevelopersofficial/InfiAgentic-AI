from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import asyncio

from app.core.config import settings
from app.core.database import engine, Base
from sqlalchemy import text
from app.core.logging_config import setup_logging
from app.core.middleware import (
    RequestIDMiddleware,
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
    RequestLoggingMiddleware
)
from app.api.v1 import auth, content, social, email, leads, crm, workflows, agents, analytics, products

# Setup logging first
setup_logging()
logger = logging.getLogger(__name__)


async def _connect_db_with_retry() -> None:
    """Connect to database with retry logic"""
    for attempt in range(settings.DATABASE_CONNECT_RETRIES):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database connection established")
            return
        except Exception as e:
            if attempt < settings.DATABASE_CONNECT_RETRIES - 1:
                logger.warning(
                    f"Database connection attempt {attempt + 1} failed: {e}. "
                    f"Retrying in {settings.DATABASE_CONNECT_RETRY_DELAY}s..."
                )
                await asyncio.sleep(settings.DATABASE_CONNECT_RETRY_DELAY)
            else:
                logger.error(f"Failed to connect to database after {settings.DATABASE_CONNECT_RETRIES} attempts")
                raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.PROJECT_NAME} API in {settings.ENVIRONMENT} mode")
    
    await _connect_db_with_retry()
    logger.info("Database tables created/verified")
    
    if settings.ENVIRONMENT == "production" and settings.SENTRY_DSN:
        try:
            import sentry_sdk
            from sentry_sdk.integrations.fastapi import FastApiIntegration
            from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
            
            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                integrations=[FastApiIntegration(), SqlalchemyIntegration()],
                traces_sample_rate=0.1,
                environment=settings.ENVIRONMENT
            )
            logger.info("Sentry error tracking initialized")
        except ImportError:
            logger.warning("Sentry SDK not installed - error tracking disabled")
    
    yield
    
    # Shutdown
    logger.info(f"Shutting down {settings.PROJECT_NAME} API")
    from app.core.redis_client import close_redis
    await close_redis()
    await engine.dispose()


# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="InfiAgentic Marketing Automation Platform API",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,  # Disable docs in production
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    openapi_url="/openapi.json" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan
)

# 1. Request ID first (so all other middleware can use it)
app.add_middleware(RequestIDMiddleware)

# 2. Security headers
app.add_middleware(SecurityHeadersMiddleware)

# 3. Request logging
app.add_middleware(RequestLoggingMiddleware)

# 4. Rate limiting
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_PER_MINUTE)

# 5. GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 6. CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  # Explicit methods
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Process-Time", "X-RateLimit-Remaining"],  # Expose custom headers
)

# 7. Trusted host middleware (security) - only in production
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }


@app.get("/ready", tags=["Health"])
async def readiness_check():
    """Readiness check - verifies all dependencies are available"""
    from app.core.database import AsyncSessionLocal
    
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        
        return {
            "status": "ready",
            "database": "connected",
            "environment": settings.ENVIRONMENT
        }
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "database": "disconnected",
                "error": str(e) if settings.DEBUG else "Service unavailable"
            }
        )


# Include API routers
app.include_router(auth.router, prefix="/v1/auth", tags=["Authentication"])
app.include_router(content.router, prefix="/v1/content", tags=["Content"])
app.include_router(social.router, prefix="/v1/social", tags=["Social"])
app.include_router(email.router, prefix="/v1/email", tags=["Email"])
app.include_router(leads.router, prefix="/v1/leads", tags=["Leads"])
app.include_router(crm.router, prefix="/v1/crm", tags=["CRM"])
app.include_router(workflows.router, prefix="/v1/workflows", tags=["Workflows"])
app.include_router(agents.router, prefix="/v1/agents", tags=["Agents"])
app.include_router(analytics.router, prefix="/v1/analytics", tags=["Analytics"])
app.include_router(products.router, prefix="/v1/products", tags=["Products"])

# Import and include calendar and approvals routers
from app.api.v1 import calendar, approvals
app.include_router(calendar.router, prefix="/v1/calendar", tags=["Calendar"])
app.include_router(approvals.router, prefix="/v1/approvals", tags=["Approvals"])


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(
        f"Unhandled exception",
        extra={
            "request_id": request_id,
            "error": str(exc),
            "path": request.url.path
        },
        exc_info=True
    )
    
    detail = str(exc) if settings.DEBUG else "Internal server error"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": detail, "request_id": request_id}
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",  # Only reload in dev
        log_level=settings.LOG_LEVEL.lower(),
        access_log=settings.ENVIRONMENT != "production"  # Disable access log in prod (we have custom logging)
    )
