from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Project
    PROJECT_NAME: str = "InfiAgentic Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    LOG_LEVEL: str = "INFO"
    
    # API
    API_V1_PREFIX: str = "/v1"
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://agentic.infidevelopers.com"
    ]
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./infiagentic.db",
    )
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_CONNECT_RETRIES: int = 5
    DATABASE_CONNECT_RETRY_DELAY: int = 2
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_MAX_CONNECTIONS: int = 50
    REDIS_CONNECT_RETRIES: int = 5
    REDIS_CONNECT_RETRY_DELAY: int = 2
    
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI Services
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    DEFAULT_AI_MODEL: str = "gpt-4"
    
    # Social Media APIs
    TWITTER_API_KEY: str = ""
    TWITTER_API_SECRET: str = ""
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    INSTAGRAM_ACCESS_TOKEN: str = ""
    
    # Email Services
    SENDGRID_API_KEY: str = ""
    MAILGUN_API_KEY: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # Call Marketing
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    
    # Products
    JYOTISHYA_API_URL: str = "https://api.jyotishya.com"
    HEALTHPEDYA_API_URL: str = "https://api.healthpedya.in"
    SCHOOPAY_API_URL: str = "https://api.schoopay.in"
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    SENTRY_DSN: str = ""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.ENVIRONMENT == "production":
            if not self.SECRET_KEY or len(self.SECRET_KEY) < 32:
                raise ValueError("SECRET_KEY must be at least 32 characters in production")
            if self.DEBUG:
                raise ValueError("DEBUG must be False in production")
        
        if not self.SECRET_KEY:
            # Generate a dev-only key with warning
            import secrets
            self.SECRET_KEY = secrets.token_urlsafe(32)
            import warnings
            warnings.warn("Using auto-generated SECRET_KEY. Set SECRET_KEY env var in production!")


settings = Settings()
