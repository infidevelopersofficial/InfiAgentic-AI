"""
Production-ready structured logging configuration.
"""
import logging
import sys
import json
from datetime import datetime, timezone
from typing import Any, Dict

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    """
    JSON formatter for structured logging in production.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields if present
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "method"):
            log_data["method"] = record.method
        if hasattr(record, "path"):
            log_data["path"] = record.path
        if hasattr(record, "status_code"):
            log_data["status_code"] = record.status_code
        if hasattr(record, "process_time_ms"):
            log_data["process_time_ms"] = record.process_time_ms
        if hasattr(record, "client_ip"):
            log_data["client_ip"] = record.client_ip
        if hasattr(record, "error"):
            log_data["error"] = record.error
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


class DevelopmentFormatter(logging.Formatter):
    """
    Human-readable formatter for development.
    """
    COLORS = {
        "DEBUG": "\033[36m",     # Cyan
        "INFO": "\033[32m",      # Green
        "WARNING": "\033[33m",   # Yellow
        "ERROR": "\033[31m",     # Red
        "CRITICAL": "\033[35m",  # Magenta
    }
    RESET = "\033[0m"
    
    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.RESET)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        message = f"{color}[{timestamp}] {record.levelname:8}{self.RESET} | {record.name} | {record.getMessage()}"
        
        # Add request ID if present
        if hasattr(record, "request_id"):
            message += f" | req_id={record.request_id}"
        
        # Add extra context
        extras = []
        for key in ["method", "path", "status_code", "process_time_ms", "client_ip"]:
            if hasattr(record, key):
                extras.append(f"{key}={getattr(record, key)}")
        
        if extras:
            message += f" | {' '.join(extras)}"
        
        if record.exc_info:
            message += f"\n{self.formatException(record.exc_info)}"
        
        return message


def setup_logging() -> None:
    """
    Configure logging based on environment.
    """
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)
    
    # Set formatter based on environment
    if settings.ENVIRONMENT == "production":
        formatter = JSONFormatter()
    else:
        formatter = DevelopmentFormatter()
    
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)
    
    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
