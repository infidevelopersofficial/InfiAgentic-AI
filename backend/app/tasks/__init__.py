"""
Celery tasks package for async background processing.
"""
from app.celery_app import celery_app

__all__ = ["celery_app"]
