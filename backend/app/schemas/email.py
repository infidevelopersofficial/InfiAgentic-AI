"""
Pydantic schemas for email endpoints.
Comprehensive validation for templates, campaigns, automations, and webhooks.
"""
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID
from enum import Enum


class TemplateTypeEnum(str, Enum):
    """Email template types"""
    promotional = "promotional"
    transactional = "transactional"
    newsletter = "newsletter"
    drip = "drip"
    welcome = "welcome"
    custom = "custom"


class CampaignStatusEnum(str, Enum):
    """Campaign status values"""
    draft = "draft"
    scheduled = "scheduled"
    sending = "sending"
    sent = "sent"
    paused = "paused"
    failed = "failed"


class TriggerTypeEnum(str, Enum):
    """Automation trigger types"""
    signup = "signup"
    purchase = "purchase"
    abandoned_cart = "abandoned_cart"
    custom = "custom"
    lead_score = "lead_score"


# ============================================================================
# EMAIL TEMPLATE SCHEMAS
# ============================================================================

class EmailTemplateCreate(BaseModel):
    """Create new email template"""
    name: str = Field(..., min_length=1, max_length=255)
    subject: str = Field(..., min_length=1, max_length=500)
    html_body: str = Field(..., min_length=1, max_length=100000)
    plain_body: Optional[str] = Field(None, max_length=100000)
    template_type: TemplateTypeEnum = Field(default="custom")
    variables: List[str] = Field(default=[], max_length=50)
    
    @field_validator("variables")
    def validate_variables(cls, v):
        """Ensure variable names are valid"""
        valid_pattern = r"^[a-zA-Z_][a-zA-Z0-9_]*$"
        import re
        for var in v:
            if not re.match(valid_pattern, var):
                raise ValueError(f"Invalid variable name: {var}")
        return v


class EmailTemplateUpdate(BaseModel):
    """Update email template"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    subject: Optional[str] = Field(None, min_length=1, max_length=500)
    html_body: Optional[str] = Field(None, min_length=1, max_length=100000)
    plain_body: Optional[str] = Field(None, max_length=100000)
    template_type: Optional[TemplateTypeEnum] = None
    variables: Optional[List[str]] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class EmailTemplateResponse(BaseModel):
    """Email template details"""
    id: UUID
    name: str
    subject: str
    template_type: str
    variables: List[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class EmailTemplateList(BaseModel):
    """Paginated list of templates"""
    items: List[EmailTemplateResponse]
    total: int
    page: int
    limit: int


# ============================================================================
# EMAIL CAMPAIGN SCHEMAS
# ============================================================================

class EmailCampaignCreate(BaseModel):
    """Create new email campaign"""
    name: str = Field(..., min_length=1, max_length=255)
    subject: str = Field(..., min_length=1, max_length=500)
    html_body: str = Field(..., min_length=1, max_length=100000)
    plain_body: Optional[str] = Field(None, max_length=100000)
    from_name: Optional[str] = Field(None, max_length=100)
    from_email: EmailStr
    reply_to: Optional[EmailStr] = None
    template_id: Optional[UUID] = None
    product_id: Optional[UUID] = None
    audience_filter: Dict[str, Any] = Field(default={}, description="Filter criteria for recipients")
    scheduled_at: Optional[datetime] = Field(None, description="ISO format datetime for scheduling")
    
    @field_validator("scheduled_at")
    def validate_future_date(cls, v):
        """Ensure scheduled time is in the future"""
        if v and v <= datetime.utcnow():
            raise ValueError("Scheduled time must be in the future")
        return v


class EmailCampaignUpdate(BaseModel):
    """Update email campaign"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    subject: Optional[str] = Field(None, min_length=1, max_length=500)
    html_body: Optional[str] = Field(None, min_length=1, max_length=100000)
    plain_body: Optional[str] = Field(None, max_length=100000)
    from_name: Optional[str] = Field(None, max_length=100)
    from_email: Optional[EmailStr] = None
    reply_to: Optional[EmailStr] = None
    audience_filter: Optional[Dict[str, Any]] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[CampaignStatusEnum] = None


class EmailCampaignResponse(BaseModel):
    """Email campaign details"""
    id: UUID
    name: str
    subject: str
    from_email: str
    from_name: Optional[str]
    status: str
    template_id: Optional[UUID]
    product_id: Optional[UUID]
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    # Metrics
    total_recipients: int
    sent_count: int
    delivered_count: int
    open_count: int
    click_count: int
    bounce_count: int
    unsubscribe_count: int
    spam_count: int
    created_at: datetime
    updated_at: datetime
    
    @property
    def open_rate(self) -> float:
        """Calculate open rate percentage"""
        if self.sent_count == 0:
            return 0.0
        return round((self.open_count / self.sent_count) * 100, 2)
    
    @property
    def click_rate(self) -> float:
        """Calculate click rate percentage"""
        if self.sent_count == 0:
            return 0.0
        return round((self.click_count / self.sent_count) * 100, 2)
    
    @property
    def bounce_rate(self) -> float:
        """Calculate bounce rate percentage"""
        if self.sent_count == 0:
            return 0.0
        return round((self.bounce_count / self.sent_count) * 100, 2)
    
    model_config = {"from_attributes": True}


class EmailCampaignList(BaseModel):
    """Paginated list of campaigns"""
    items: List[EmailCampaignResponse]
    total: int
    page: int
    limit: int


class SendCampaignRequest(BaseModel):
    """Send campaign to recipients"""
    recipient_ids: List[str] = Field(..., min_items=1, max_items=50000, description="Email addresses or contact IDs")


class SendCampaignResponse(BaseModel):
    """Response from sending campaign"""
    campaign_id: UUID
    status: str
    total_queued: int
    estimated_send_time: str


# ============================================================================
# EMAIL AUTOMATION SCHEMAS
# ============================================================================

class EmailSequenceStep(BaseModel):
    """Step in automation sequence"""
    template_id: UUID
    delay_days: int = Field(default=0, ge=0, le=365)
    delay_hours: int = Field(default=0, ge=0, le=23)
    subject_override: Optional[str] = None


class EmailAutomationCreate(BaseModel):
    """Create new email automation"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    trigger_type: TriggerTypeEnum
    trigger_conditions: Dict[str, Any] = Field(default={})
    email_sequence: List[EmailSequenceStep] = Field(..., min_items=1, max_items=20)
    
    @field_validator("email_sequence")
    def validate_sequence(cls, v):
        """Validate email sequence has unique delays"""
        delays = [(step.delay_days, step.delay_hours) for step in v]
        if len(delays) != len(set(delays)):
            raise ValueError("Duplicate delays in email sequence")
        return v


class EmailAutomationUpdate(BaseModel):
    """Update email automation"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    trigger_conditions: Optional[Dict[str, Any]] = None
    email_sequence: Optional[List[EmailSequenceStep]] = None
    is_active: Optional[bool] = None


class EmailAutomationResponse(BaseModel):
    """Email automation details"""
    id: UUID
    name: str
    description: Optional[str]
    trigger_type: str
    trigger_conditions: Dict[str, Any]
    email_sequence: List[Dict]
    is_active: bool
    total_enrolled: int
    total_completed: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class EmailAutomationList(BaseModel):
    """Paginated list of automations"""
    items: List[EmailAutomationResponse]
    total: int
    page: int
    limit: int


# ============================================================================
# EMAIL ANALYTICS SCHEMAS
# ============================================================================

class CampaignMetricsResponse(BaseModel):
    """Detailed campaign metrics"""
    campaign_id: UUID
    total_recipients: int
    sent_count: int
    delivered_count: int
    open_count: int
    click_count: int
    bounce_count: int
    unsubscribe_count: int
    spam_count: int
    open_rate: float
    click_rate: float
    bounce_rate: float
    delivery_rate: float
    last_updated: datetime


class AggregatedEmailMetricsResponse(BaseModel):
    """Aggregated email metrics across all campaigns"""
    total_campaigns: int
    total_recipients: int
    total_sent: int
    total_delivered: int
    total_opens: int
    total_clicks: int
    total_bounces: int
    total_unsubscribes: int
    avg_open_rate: float
    avg_click_rate: float
    avg_bounce_rate: float
    best_performing_campaign: Optional[CampaignMetricsResponse]
    date_range_start: datetime
    date_range_end: datetime


# ============================================================================
# WEBHOOK SCHEMAS
# ============================================================================

class SendGridWebhookEvent(BaseModel):
    """SendGrid webhook event"""
    event: str
    email: str
    timestamp: int
    smtp_id: Optional[str] = None
    message_id: Optional[str] = None
    response: Optional[str] = None
    bounce_type: Optional[str] = None
    bounce_reason: Optional[str] = None
    status: Optional[str] = None
    reason: Optional[str] = None
    asm_group_id: Optional[int] = None
    ip: Optional[str] = None
    tls: Optional[bool] = None
    url: Optional[str] = None
    user_agent: Optional[str] = None
    url_offset: Optional[Dict] = None


class WebhookVerificationRequest(BaseModel):
    """Webhook signature verification"""
    signature: str = Field(..., description="X-Twilio-Email-Event-Webhook-Signature header")
    timestamp: str = Field(..., description="X-Twilio-Email-Event-Webhook-Timestamp header")
    body: str = Field(..., description="Raw request body")


# ============================================================================
# BATCH OPERATION SCHEMAS
# ============================================================================

class BulkSendRequest(BaseModel):
    """Bulk send emails"""
    campaign_ids: List[UUID] = Field(..., min_items=1, max_items=100)
    schedule_for_now: bool = Field(default=False)


class BulkSendResponse(BaseModel):
    """Response from bulk send"""
    queued: int
    failed: int
    results: Dict[str, str]


class TestEmailRequest(BaseModel):
    """Send test email"""
    recipient_email: EmailStr
    subject: str
    html_body: str
    plain_body: Optional[str] = None


class TestEmailResponse(BaseModel):
    """Test email response"""
    status: str
    message_id: str
    recipient: str
