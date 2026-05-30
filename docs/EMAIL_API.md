# Email API Documentation

Complete reference for email campaign management, automation, and real-time metrics tracking.

**Base URL:** `http://localhost:8000/v1/email`  
**Authentication:** Bearer token (JWT)  
**Rate Limit:** 100 requests/minute per organization

---

## Table of Contents

1. [Email Templates](#email-templates)
2. [Email Campaigns](#email-campaigns)
3. [Email Sending](#email-sending)
4. [Email Automations](#email-automations)
5. [Analytics](#analytics)
6. [Error Handling](#error-handling)
7. [Webhooks](#webhooks)
8. [Integration Guide](#integration-guide)

---

## Email Templates

Email templates provide reusable content for campaigns and automations.

### Create Template

Create a new email template with subject, HTML, and plain text versions.

```http
POST /templates
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Weekly Newsletter",
  "subject": "This Week's Updates - {{week_number}}",
  "template_type": "newsletter",
  "html_body": "<html><body><h1>Hello {{first_name}}</h1><p>{{content}}</p></body></html>",
  "plain_body": "Hello {{first_name}}\n{{content}}",
  "variables": ["first_name", "week_number", "content"]
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Weekly Newsletter",
  "subject": "This Week's Updates - {{week_number}}",
  "template_type": "newsletter",
  "variables": ["first_name", "week_number", "content"],
  "is_active": true,
  "created_at": "2024-12-10T10:00:00Z",
  "updated_at": "2024-12-10T10:00:00Z"
}
```

### List Templates

```http
GET /templates?page=1&limit=20&template_type=newsletter&is_active=true
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Weekly Newsletter",
      "subject": "This Week's Updates - {{week_number}}",
      "template_type": "newsletter",
      "variables": ["first_name", "week_number", "content"],
      "is_active": true,
      "created_at": "2024-12-10T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### Get Template

```http
GET /templates/{template_id}
Authorization: Bearer {token}
```

### Update Template

```http
PATCH /templates/{template_id}
Authorization: Bearer {token}

{
  "subject": "Updated Subject",
  "is_active": false
}
```

### Delete Template

```http
DELETE /templates/{template_id}
Authorization: Bearer {token}
```

---

## Email Campaigns

Campaigns deliver emails to recipients with comprehensive tracking.

### Create Campaign

```http
POST /campaigns
Authorization: Bearer {token}

{
  "name": "Q4 Product Launch",
  "subject": "Introducing Our Q4 Innovation",
  "html_body": "<html><body><h1>New Product</h1></body></html>",
  "plain_body": "New Product\nCheck it out!",
  "from_email": "campaigns@company.com",
  "from_name": "Product Team",
  "reply_to": "support@company.com",
  "template_id": null,
  "product_id": "prod-123",
  "audience_filter": {"segment": "premium_users"},
  "scheduled_at": null
}
```

**Response (201):**
```json
{
  "id": "camp-123",
  "name": "Q4 Product Launch",
  "subject": "Introducing Our Q4 Innovation",
  "from_email": "campaigns@company.com",
  "from_name": "Product Team",
  "status": "draft",
  "template_id": null,
  "product_id": "prod-123",
  "scheduled_at": null,
  "sent_at": null,
  "total_recipients": 0,
  "sent_count": 0,
  "delivered_count": 0,
  "open_count": 0,
  "click_count": 0,
  "bounce_count": 0,
  "unsubscribe_count": 0,
  "spam_count": 0,
  "created_at": "2024-12-10T10:00:00Z",
  "updated_at": "2024-12-10T10:00:00Z"
}
```

**Campaign Statuses:**
- `draft` - Not yet sent
- `scheduled` - Scheduled for future delivery
- `sending` - Currently being sent
- `sent` - Successfully sent
- `paused` - Paused mid-send
- `failed` - Send failed

### List Campaigns

```http
GET /campaigns?page=1&limit=20&status=sent&product_id=prod-123
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "items": [
    {
      "id": "camp-123",
      "name": "Q4 Product Launch",
      "status": "sent",
      "sent_count": 5000,
      "open_count": 1250,
      "click_count": 450
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### Get Campaign

```http
GET /campaigns/{campaign_id}
Authorization: Bearer {token}
```

### Update Campaign

Edit draft or scheduled campaigns:

```http
PATCH /campaigns/{campaign_id}
Authorization: Bearer {token}

{
  "subject": "Updated Subject",
  "scheduled_at": "2024-12-15T14:30:00Z"
}
```

**Note:** Cannot update sent or sending campaigns.

### Delete Campaign

```http
DELETE /campaigns/{campaign_id}
Authorization: Bearer {token}
```

---

## Email Sending

### Send Campaign

Send campaign to recipients immediately:

```http
POST /campaigns/{campaign_id}/send
Authorization: Bearer {token}

{
  "recipient_ids": ["user@example.com", "another@example.com"]
}
```

**Response (200):**
```json
{
  "campaign_id": "camp-123",
  "status": "queued",
  "total_queued": 2,
  "estimated_send_time": "Immediately"
}
```

**Notes:**
- Maximum 50,000 recipients per request
- Sending is asynchronous via Celery
- Metrics update in real-time via webhooks

### Bulk Send

Send multiple campaigns:

```http
POST /campaigns/bulk/send
Authorization: Bearer {token}

{
  "campaign_ids": ["camp-123", "camp-456"],
  "schedule_for_now": true
}
```

**Response (200):**
```json
{
  "queued": 2,
  "failed": 0,
  "results": {
    "camp-123": "queued",
    "camp-456": "queued"
  }
}
```

### Test Email

Send test email to verify content:

```http
POST /test-email
Authorization: Bearer {token}

{
  "recipient_email": "test@example.com",
  "subject": "Test Subject",
  "html_body": "<html><body>Test</body></html>",
  "plain_body": "Test"
}
```

**Response (200):**
```json
{
  "status": "queued",
  "message_id": "test_email",
  "recipient": "test@example.com"
}
```

---

## Email Automations

Automated email sequences triggered by user actions.

### Create Automation

```http
POST /automations
Authorization: Bearer {token}

{
  "name": "Welcome Series",
  "description": "Sent when user signs up",
  "trigger_type": "signup",
  "trigger_conditions": {"min_plan": "free"},
  "email_sequence": [
    {
      "template_id": "tpl-welcome",
      "delay_days": 0,
      "delay_hours": 0,
      "subject_override": null
    },
    {
      "template_id": "tpl-features",
      "delay_days": 1,
      "delay_hours": 0,
      "subject_override": null
    },
    {
      "template_id": "tpl-upgrade",
      "delay_days": 3,
      "delay_hours": 0,
      "subject_override": "Limited Time: 50% Off Premium"
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "auto-123",
  "name": "Welcome Series",
  "description": "Sent when user signs up",
  "trigger_type": "signup",
  "trigger_conditions": {"min_plan": "free"},
  "email_sequence": [...],
  "is_active": true,
  "total_enrolled": 0,
  "total_completed": 0,
  "created_at": "2024-12-10T10:00:00Z",
  "updated_at": "2024-12-10T10:00:00Z"
}
```

**Trigger Types:**
- `signup` - New user registration
- `purchase` - Purchase made
- `abandoned_cart` - Cart abandoned
- `lead_score` - Lead score threshold reached
- `custom` - Custom trigger

### List Automations

```http
GET /automations?page=1&limit=20&trigger_type=signup&is_active=true
Authorization: Bearer {token}
```

### Update Automation

```http
PATCH /automations/{automation_id}
Authorization: Bearer {token}

{
  "is_active": false,
  "email_sequence": [...]
}
```

### Delete Automation

```http
DELETE /automations/{automation_id}
Authorization: Bearer {token}
```

---

## Analytics

### Get Aggregated Metrics

Campaign-wide statistics across date range:

```http
GET /analytics?days=30
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "total_campaigns": 5,
  "total_recipients": 25000,
  "total_sent": 24500,
  "total_delivered": 24200,
  "total_opens": 7260,
  "total_clicks": 1936,
  "total_bounces": 300,
  "total_unsubscribes": 150,
  "avg_open_rate": 29.63,
  "avg_click_rate": 8.0,
  "avg_bounce_rate": 1.22,
  "best_performing_campaign": {
    "campaign_id": "camp-123",
    "open_rate": 35.2,
    "click_rate": 12.5,
    "bounce_rate": 0.8,
    "delivery_rate": 99.2
  },
  "date_range_start": "2024-11-10T00:00:00Z",
  "date_range_end": "2024-12-10T00:00:00Z"
}
```

### Get Campaign Metrics

Detailed metrics for single campaign:

```http
GET /campaigns/{campaign_id}/metrics
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "campaign_id": "camp-123",
  "total_recipients": 5000,
  "sent_count": 4900,
  "delivered_count": 4850,
  "open_count": 1455,
  "click_count": 436,
  "bounce_count": 100,
  "unsubscribe_count": 50,
  "spam_count": 15,
  "open_rate": 29.69,
  "click_rate": 8.90,
  "bounce_rate": 2.04,
  "delivery_rate": 98.98,
  "last_updated": "2024-12-10T10:15:00Z"
}
```

---

## Error Handling

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Campaign sent successfully |
| 201 | Created | Template created |
| 204 | No Content | Campaign deleted |
| 400 | Bad Request | Invalid email format |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Campaign doesn't exist |
| 409 | Conflict | Template name already exists |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Internal error |

### Error Response Format

```json
{
  "detail": "Campaign already sent"
}
```

### Common Errors

**Invalid Email**
```
Status: 400
{
  "detail": "Invalid email format for recipient"
}
```

**Campaign Not Found**
```
Status: 404
{
  "detail": "Email campaign not found"
}
```

**Duplicate Template Name**
```
Status: 409
{
  "detail": "Template with this name already exists"
}
```

**Cannot Update Sent Campaign**
```
Status: 400
{
  "detail": "Cannot update sent or sending campaigns"
}
```

---

## Webhooks

SendGrid webhooks update campaign metrics in real-time.

### Webhook Events

**Event Types:**
- `delivered` - Email successfully delivered
- `open` - Email opened by recipient
- `click` - Link clicked in email
- `bounce` - Email bounced (soft/hard)
- `spamreport` - Marked as spam
- `unsubscribe` - Recipient unsubscribed

### Webhook Configuration

Configure in SendGrid dashboard:

1. Go to Settings → Event Webhook
2. Set URL to: `https://yourdomain.com/v1/email/webhooks/sendgrid`
3. Enable event types to track
4. Copy signing key to `SENDGRID_WEBHOOK_KEY` env var

### Webhook Payload

```json
{
  "event": "open",
  "email": "user@example.com",
  "timestamp": 1702238400,
  "message_id": "msg_123abc",
  "campaign_id": "camp-123"
}
```

---

## Integration Guide

### Python (httpx)

```python
import httpx

async with httpx.AsyncClient() as client:
    # Create template
    response = await client.post(
        "http://localhost:8000/v1/email/templates",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Welcome",
            "subject": "Welcome {{name}}",
            "html_body": "<h1>Hello {{name}}</h1>",
            "variables": ["name"]
        }
    )
    print(response.json())
```

### JavaScript (Fetch)

```javascript
const token = 'your_jwt_token';

// Create campaign
const response = await fetch('http://localhost:8000/v1/email/campaigns', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Q4 Launch',
    subject: 'New Product',
    html_body: '<h1>New!</h1>',
    from_email: 'campaigns@company.com'
  })
});

const campaign = await response.json();
console.log(campaign);
```

### React Hook (SWR)

```jsx
import useSWR from 'swr';

function CampaignMetrics({ campaignId }) {
  const { data, error, isLoading } = useSWR(
    `/v1/email/campaigns/${campaignId}/metrics`,
    fetcher,
    { 
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (error) return <div>Failed to load metrics</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Open Rate: {data.open_rate}%</p>
      <p>Click Rate: {data.click_rate}%</p>
      <p>Bounce Rate: {data.bounce_rate}%</p>
    </div>
  );
}
```

### cURL

```bash
# Create template
curl -X POST http://localhost:8000/v1/email/templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Newsletter",
    "subject": "Weekly Update",
    "html_body": "<html>...</html>",
    "template_type": "newsletter"
  }'

# Send campaign
curl -X POST http://localhost:8000/v1/email/campaigns/camp-123/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_ids": ["user@example.com"]
  }'

# Get metrics
curl -X GET http://localhost:8000/v1/email/analytics?days=30 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Best Practices

### Template Variables

Use meaningful variable names matching your data:

```json
{
  "variables": ["first_name", "company_name", "purchase_amount"]
}
```

Inject via Celery when sending:

```python
html_body = template.html_body.format(
    first_name=user.first_name,
    company_name=user.company,
    purchase_amount=purchase.amount
)
```

### Scheduling

Schedule emails for optimal times:

```json
{
  "scheduled_at": "2024-12-15T09:00:00Z"
}
```

Celery Beat automatically sends scheduled emails every 5 minutes.

### Segmentation

Use `audience_filter` for targeting:

```json
{
  "audience_filter": {
    "segment": "premium_users",
    "country": "US",
    "signup_before": "2024-01-01"
  }
}
```

### Metrics Monitoring

Regular check campaign performance:

```python
# Check metrics daily
metrics = await client.get(
    f"/v1/email/campaigns/{campaign_id}/metrics",
    headers={"Authorization": f"Bearer {token}"}
)

if metrics["bounce_rate"] > 5:
    alert_team("High bounce rate detected")
```

### Rate Limiting

Handle rate limits gracefully:

```python
if response.status_code == 429:
    wait_seconds = int(response.headers.get('retry-after', 60))
    await asyncio.sleep(wait_seconds)
```

---

## Provider Configuration

### SendGrid

Set environment variables:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=campaigns@company.com
```

### Mailgun

```bash
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mail.company.com
```

### SMTP

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Troubleshooting

**High Bounce Rate**
- Verify email list quality
- Check sender reputation with ISPs
- Remove inactive addresses

**Low Open Rate**
- Test subject lines
- Optimize send time
- Improve preview text

**Emails Not Sending**
- Verify API keys are set
- Check rate limits
- Review Celery task logs
- Confirm webhook configuration

**Webhook Events Missing**
- Verify webhook URL is accessible
- Check signing key matches
- Review SendGrid event logs
- Confirm events are enabled

---

## Support

For issues or questions:

1. Check error logs: `docker logs backend`
2. Review Celery tasks: `docker exec celery celery -A app.celery_app events`
3. Check database: `psql -d email_db -c "SELECT * FROM email_campaigns;"`
4. Review SendGrid dashboard for API errors
