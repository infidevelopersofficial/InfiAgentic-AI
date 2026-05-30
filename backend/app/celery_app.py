"""
Celery application configuration for async task processing.
Production-hardened with proper error handling and dead letter queues.
"""
from celery import Celery
from celery.signals import task_failure, task_success, task_retry
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    "infiagentic",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.content_tasks",
        "app.tasks.social_tasks",
        "app.tasks.email_tasks",
        "app.tasks.agent_tasks",
        "app.tasks.analytics_tasks",
    ]
)

# Celery configuration - production hardened
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task execution settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_time_limit=3600,  # 1 hour hard limit
    task_soft_time_limit=3000,  # 50 min soft limit
    
    # Retry settings
    task_default_retry_delay=60,  # 1 minute
    task_max_retries=3,
    
    # Worker settings
    worker_prefetch_multiplier=1,
    worker_concurrency=4,
    worker_max_tasks_per_child=1000,  # Restart worker after 1000 tasks to prevent memory leaks
    worker_disable_rate_limits=False,
    
    # Result backend settings
    result_expires=86400,  # 24 hours
    result_extended=True,  # Store task args and kwargs
    
    # Broker settings for reliability
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
    broker_pool_limit=10,
    
    # Dead letter queue for failed tasks
    task_routes={
        "app.tasks.*": {"queue": "default"},
    },
    task_queues={
        "default": {
            "exchange": "default",
            "routing_key": "default",
        },
        "high_priority": {
            "exchange": "high_priority",
            "routing_key": "high_priority",
        },
        "dead_letter": {
            "exchange": "dead_letter",
            "routing_key": "dead_letter",
        },
    },
    
    # Beat scheduler for periodic tasks
    beat_schedule={
        "sync-social-metrics": {
            "task": "app.tasks.social_tasks.sync_all_social_metrics",
            "schedule": 3600.0,  # Every hour
        },
        "process-email-queue": {
            "task": "app.tasks.email_tasks.process_scheduled_emails",
            "schedule": 300.0,  # Every 5 minutes
        },
        "aggregate-daily-analytics": {
            "task": "app.tasks.analytics_tasks.aggregate_daily_metrics",
            "schedule": 86400.0,  # Once daily
        },
        "cleanup-old-workflow-runs": {
            "task": "app.tasks.agent_tasks.cleanup_old_runs",
            "schedule": 86400.0,  # Once daily
        },
        "cleanup-token-blacklist": {
            "task": "app.tasks.agent_tasks.cleanup_token_blacklist",
            "schedule": 3600.0,  # Every hour
        },
    },
)


# Signal handlers for monitoring
@task_failure.connect
def handle_task_failure(sender=None, task_id=None, exception=None, args=None, kwargs=None, traceback=None, **kw):
    """Log failed tasks for monitoring"""
    logger.error(
        f"Task {sender.name}[{task_id}] failed",
        extra={
            "task_name": sender.name,
            "task_id": task_id,
            "exception": str(exception),
            "args": args,
            "kwargs": kwargs,
        },
        exc_info=True
    )


@task_success.connect
def handle_task_success(sender=None, result=None, **kw):
    """Log successful tasks for monitoring"""
    logger.info(
        f"Task {sender.name} completed successfully",
        extra={
            "task_name": sender.name,
            "result_type": type(result).__name__,
        }
    )


@task_retry.connect
def handle_task_retry(sender=None, reason=None, request=None, **kw):
    """Log task retries for monitoring"""
    logger.warning(
        f"Task {sender.name} retrying",
        extra={
            "task_name": sender.name,
            "reason": str(reason),
            "retries": request.retries if request else 0,
        }
    )
