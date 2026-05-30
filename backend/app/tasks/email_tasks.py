"""
Email-related async tasks with SendGrid, Mailgun, and SMTP integration.
Handles campaign sending, automation workflows, and metrics syncing.
"""
from app.celery_app import celery_app
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.email import EmailCampaign, EmailTemplate
from sqlalchemy import select, update
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
import asyncio
import re

logger = logging.getLogger(__name__)


# ============================================================================
# SENDGRID INTEGRATION
# ============================================================================

def get_sendgrid_client():
    """Initialize SendGrid client"""
    try:
        from sendgrid import SendGridAPIClient
        return SendGridAPIClient(settings.SENDGRID_API_KEY)
    except ImportError:
        logger.error("SendGrid SDK not installed: pip install sendgrid")
        return None


async def send_emails_via_sendgrid(
    campaign_id: str,
    recipient_emails: List[str],
    subject: str,
    html_body: str,
    plain_body: str,
    from_email: str,
    from_name: str,
    reply_to: str
) -> Dict:
    """
    Send emails using SendGrid API.
    Supports tracking opens, clicks, bounces.
    """
    try:
        from sendgrid.helpers.mail import Mail, To
        
        client = get_sendgrid_client()
        if not client:
            raise ValueError("SendGrid client not available")
        
        sent_count = 0
        failed_emails = []
        
        # Send emails in batches
        batch_size = 100
        for i in range(0, len(recipient_emails), batch_size):
            batch = recipient_emails[i:i+batch_size]
            
            for recipient in batch:
                try:
                    message = Mail(
                        from_email=from_email,
                        to_emails=To(recipient),
                        subject=subject,
                        plain_text_content=plain_body,
                        html_content=html_body
                    )
                    
                    message.reply_to = reply_to
                    
                    # Add tracking
                    message.tracking_settings.click_tracking.enable = True
                    message.tracking_settings.open_tracking.enable = True
                    message.tracking_settings.subscription_tracking.enable = True
                    
                    # Add custom args for tracking
                    message.custom_args = {
                        "campaign_id": campaign_id,
                        "timestamp": str(datetime.utcnow())
                    }
                    
                    response = client.send(message)
                    
                    if response.status_code in [200, 201, 202]:
                        sent_count += 1
                        logger.info(f"Email sent to {recipient} via SendGrid")
                    else:
                        failed_emails.append(recipient)
                        logger.warning(f"SendGrid response {response.status_code} for {recipient}")
                        
                except Exception as e:
                    failed_emails.append(recipient)
                    logger.warning(f"Failed to send to {recipient}: {str(e)}")
        
        return {
            "success": True,
            "sent": sent_count,
            "failed": len(failed_emails),
            "failed_emails": failed_emails,
            "provider": "sendgrid"
        }
    
    except Exception as e:
        logger.error(f"SendGrid batch send failed: {str(e)}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "provider": "sendgrid"
        }


# ============================================================================
# SMTP FALLBACK
# ============================================================================

async def send_emails_via_smtp(
    campaign_id: str,
    recipient_emails: List[str],
    subject: str,
    html_body: str,
    plain_body: str,
    from_email: str,
    from_name: str,
    reply_to: str
) -> Dict:
    """
    Send emails using SMTP (Gmail, custom SMTP server).
    Fallback when SendGrid is unavailable.
    """
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        sent_count = 0
        failed_emails = []
        
        # Connect to SMTP server
        if settings.SMTP_HOST == "smtp.gmail.com":
            server = smtplib.SMTP_TLS(settings.SMTP_HOST, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            if settings.SMTP_PORT == 587:
                server.starttls()
        
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        for recipient in recipient_emails:
            try:
                message = MIMEMultipart("alternative")
                message["Subject"] = subject
                message["From"] = f"{from_name} <{from_email}>"
                message["To"] = recipient
                message["Reply-To"] = reply_to
                
                part1 = MIMEText(plain_body, "plain")
                part2 = MIMEText(html_body, "html")
                
                message.attach(part1)
                message.attach(part2)
                
                server.sendmail(from_email, recipient, message.as_string())
                sent_count += 1
                logger.info(f"Email sent to {recipient} via SMTP")
                
            except Exception as e:
                failed_emails.append(recipient)
                logger.warning(f"SMTP send to {recipient} failed: {e}")
        
        server.quit()
        
        return {
            "success": True,
            "sent": sent_count,
            "failed": len(failed_emails),
            "failed_emails": failed_emails,
            "provider": "smtp"
        }
    
    except Exception as e:
        logger.error(f"SMTP send failed: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "provider": "smtp"
        }


# ============================================================================
# MAILGUN INTEGRATION (ALTERNATIVE)
# ============================================================================

async def send_emails_via_mailgun(
    campaign_id: str,
    recipient_emails: List[str],
    subject: str,
    html_body: str,
    plain_body: str,
    from_email: str,
    from_name: str,
    reply_to: str
) -> Dict:
    """
    Send emails using Mailgun API.
    Alternative to SendGrid.
    """
    try:
        import requests
        
        domain = settings.MAILGUN_API_KEY.split("key-")[1] if "key-" in settings.MAILGUN_API_KEY else None
        if not domain:
            raise ValueError("Invalid Mailgun API key format")
        
        sent_count = 0
        failed_emails = []
        
        for recipient in recipient_emails:
            try:
                response = requests.post(
                    f"https://api.mailgun.net/v3/{domain}/messages",
                    auth=("api", settings.MAILGUN_API_KEY),
                    data={
                        "from": f"{from_name} <{from_email}>",
                        "to": recipient,
                        "reply-to": reply_to,
                        "subject": subject,
                        "html": html_body,
                        "text": plain_body,
                        "o:tracking": "yes",
                        "o:tracking-clicks": "yes",
                        "o:tracking-opens": "yes",
                        "v:campaign_id": campaign_id
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    sent_count += 1
                    logger.info(f"Email sent to {recipient} via Mailgun")
                else:
                    failed_emails.append(recipient)
                    logger.warning(f"Mailgun error {response.status_code}: {response.text}")
                    
            except Exception as e:
                failed_emails.append(recipient)
                logger.warning(f"Mailgun send to {recipient} failed: {e}")
        
        return {
            "success": True,
            "sent": sent_count,
            "failed": len(failed_emails),
            "failed_emails": failed_emails,
            "provider": "mailgun"
        }
    
    except Exception as e:
        logger.error(f"Mailgun send failed: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "provider": "mailgun"
        }


# ============================================================================
# CELERY TASKS
# ============================================================================

@celery_app.task(bind=True, max_retries=3, default_retry_delay=300)
def send_campaign_emails(
    self,
    campaign_id: str,
    recipient_emails: List[str],
    org_id: str
) -> Dict:
    """
    Send campaign emails to recipients.
    Retries up to 3 times with exponential backoff.
    """
    try:
        logger.info(f"Starting email campaign {campaign_id} to {len(recipient_emails)} recipients")
        
        loop = asyncio.get_event_loop()
        
        async def send_emails():
            async with AsyncSessionLocal() as db:
                # Get campaign
                result = await db.execute(
                    select(EmailCampaign).where(EmailCampaign.id == campaign_id)
                )
                campaign = result.scalar_one_or_none()
                
                if not campaign:
                    raise ValueError(f"Campaign {campaign_id} not found")
                
                # Determine which provider to use
                if settings.SENDGRID_API_KEY:
                    send_result = await send_emails_via_sendgrid(
                        campaign_id,
                        recipient_emails,
                        campaign.subject,
                        campaign.html_body,
                        campaign.plain_body,
                        campaign.from_email,
                        campaign.from_name,
                        campaign.reply_to
                    )
                elif settings.MAILGUN_API_KEY:
                    send_result = await send_emails_via_mailgun(
                        campaign_id,
                        recipient_emails,
                        campaign.subject,
                        campaign.html_body,
                        campaign.plain_body,
                        campaign.from_email,
                        campaign.from_name,
                        campaign.reply_to
                    )
                else:
                    send_result = await send_emails_via_smtp(
                        campaign_id,
                        recipient_emails,
                        campaign.subject,
                        campaign.html_body,
                        campaign.plain_body,
                        campaign.from_email,
                        campaign.from_name,
                        campaign.reply_to
                    )
                
                # Update campaign with results
                await db.execute(
                    update(EmailCampaign).where(
                        EmailCampaign.id == campaign_id
                    ).values(
                        sent_count=send_result.get("sent", 0),
                        status="sent" if send_result.get("success") else "failed",
                        sent_at=datetime.utcnow()
                    )
                )
                await db.commit()
                
                logger.info(f"Campaign {campaign_id} sent: {send_result.get('sent', 0)} sent, {send_result.get('failed', 0)} failed")
                
                return send_result
        
        result = loop.run_until_complete(send_emails())
        
        if not result.get("success"):
            raise Exception(result.get("error", "Unknown error"))
        
        return result
        
    except Exception as exc:
        logger.error(f"Email campaign send failed (attempt {self.request.retries + 1}): {exc}")
        
        if self.request.retries < self.max_retries:
            retry_delay = 300 * (2 ** self.request.retries)
            raise self.retry(exc=exc, countdown=retry_delay)
        else:
            logger.error(f"Final failure for campaign {campaign_id}")
            return {"success": False, "error": str(exc)}


@celery_app.task
def send_test_email_task(
    recipient_email: str,
    subject: str,
    html_body: str,
    plain_body: Optional[str],
    org_id: str
) -> Dict:
    """Send test email"""
    try:
        logger.info(f"Sending test email to {recipient_email}")
        
        loop = asyncio.get_event_loop()
        
        async def send_test():
            if settings.SENDGRID_API_KEY:
                return await send_emails_via_sendgrid(
                    "test",
                    [recipient_email],
                    subject,
                    html_body,
                    plain_body or html_body,
                    settings.SMTP_USER,
                    "Test Email",
                    settings.SMTP_USER
                )
            else:
                return await send_emails_via_smtp(
                    "test",
                    [recipient_email],
                    subject,
                    html_body,
                    plain_body or html_body,
                    settings.SMTP_USER,
                    "Test Email",
                    settings.SMTP_USER
                )
        
        result = loop.run_until_complete(send_test())
        logger.info(f"Test email result: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Test email send failed: {str(e)}")
        return {"success": False, "error": str(e)}


@celery_app.task
def sync_email_metrics(campaign_id: str) -> Dict:
    """
    Sync email metrics from SendGrid webhook events.
    Metrics are updated via webhook, this fetches latest.
    """
    try:
        logger.info(f"Syncing metrics for campaign {campaign_id}")
        
        loop = asyncio.get_event_loop()
        
        async def fetch_metrics():
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(EmailCampaign).where(EmailCampaign.id == campaign_id)
                )
                campaign = result.scalar_one_or_none()
                
                if not campaign:
                    raise ValueError(f"Campaign {campaign_id} not found")
                
                # In production, fetch from SendGrid API
                # For now, metrics are updated via webhooks
                return {
                    "campaign_id": campaign_id,
                    "open_count": campaign.open_count,
                    "click_count": campaign.click_count,
                    "bounce_count": campaign.bounce_count,
                    "unsubscribe_count": campaign.unsubscribe_count,
                    "timestamp": datetime.utcnow().isoformat()
                }
        
        result = loop.run_until_complete(fetch_metrics())
        return result
        
    except Exception as e:
        logger.error(f"Failed to sync email metrics: {str(e)}")
        return {"error": str(e)}


@celery_app.task
def process_scheduled_emails() -> Dict:
    """
    Periodic task to send emails scheduled for now or past.
    Scheduled to run every 5 minutes via beat scheduler.
    """
    try:
        logger.info("Processing scheduled emails")
        
        loop = asyncio.get_event_loop()
        
        async def process():
            async with AsyncSessionLocal() as db:
                now = datetime.utcnow()
                
                result = await db.execute(
                    select(EmailCampaign).where(
                        and_(
                            EmailCampaign.status == "scheduled",
                            EmailCampaign.scheduled_at <= now
                        )
                    )
                )
                campaigns = result.scalars().all()
                
                processed = 0
                for campaign in campaigns:
                    # Queue for sending
                    send_campaign_emails.delay(
                        str(campaign.id),
                        [],  # Recipients determined from audience_filter
                        str(campaign.org_id)
                    )
                    processed += 1
                
                return {"processed": processed}
        
        result = loop.run_until_complete(process())
        logger.info(f"Processed {result.get('processed', 0)} scheduled emails")
        return result
        
    except Exception as e:
        logger.error(f"Scheduled email processing failed: {str(e)}")
        return {"error": str(e)}


@celery_app.task
def handle_sendgrid_webhook(
    event_type: str,
    email: str,
    campaign_id: str,
    **kwargs
) -> Dict:
    """
    Handle SendGrid webhook events (open, click, bounce, etc).
    Updates campaign metrics in real-time.
    """
    try:
        logger.info(f"Processing SendGrid webhook: {event_type} for {email} campaign {campaign_id}")
        
        loop = asyncio.get_event_loop()
        
        async def update_metrics():
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(EmailCampaign).where(EmailCampaign.id == campaign_id)
                )
                campaign = result.scalar_one_or_none()
                
                if not campaign:
                    logger.warning(f"Campaign {campaign_id} not found for webhook")
                    return
                
                # Update based on event type
                if event_type == "open":
                    await db.execute(
                        update(EmailCampaign).where(
                            EmailCampaign.id == campaign_id
                        ).values(
                            open_count=EmailCampaign.open_count + 1
                        )
                    )
                elif event_type == "click":
                    await db.execute(
                        update(EmailCampaign).where(
                            EmailCampaign.id == campaign_id
                        ).values(
                            click_count=EmailCampaign.click_count + 1
                        )
                    )
                elif event_type == "bounce":
                    await db.execute(
                        update(EmailCampaign).where(
                            EmailCampaign.id == campaign_id
                        ).values(
                            bounce_count=EmailCampaign.bounce_count + 1
                        )
                    )
                elif event_type == "spamreport":
                    await db.execute(
                        update(EmailCampaign).where(
                            EmailCampaign.id == campaign_id
                        ).values(
                            spam_count=EmailCampaign.spam_count + 1
                        )
                    )
                elif event_type == "unsubscribe":
                    await db.execute(
                        update(EmailCampaign).where(
                            EmailCampaign.id == campaign_id
                        ).values(
                            unsubscribe_count=EmailCampaign.unsubscribe_count + 1
                        )
                    )
                elif event_type == "delivered":
                    await db.execute(
                        update(EmailCampaign).where(
                            EmailCampaign.id == campaign_id
                        ).values(
                            delivered_count=EmailCampaign.delivered_count + 1
                        )
                    )
                
                await db.commit()
                logger.info(f"Updated metrics for campaign {campaign_id}: {event_type}")
        
        loop.run_until_complete(update_metrics())
        return {"processed": True, "event": event_type}
        
    except Exception as e:
        logger.error(f"Webhook processing failed: {str(e)}")
        return {"error": str(e)}
