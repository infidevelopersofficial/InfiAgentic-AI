# API Integrations Guide - InfiAgentic Platform

This guide provides setup instructions for all third-party API integrations used in the InfiAgentic platform.

## Table of Contents

1. [AI Services](#ai-services)
2. [Social Media APIs](#social-media-apis)
3. [Email Services](#email-services)
4. [Communication Services](#communication-services)
5. [Analytics](#analytics)
6. [Testing APIs](#testing-apis)

---

## AI Services

### OpenAI Integration

#### Setup Steps

1. **Create OpenAI Account**
   - Go to [openai.com](https://openai.com)
   - Sign up or log in
   - Navigate to [API keys](https://platform.openai.com/account/api-keys)

2. **Create API Key**
   - Click "Create new secret key"
   - Copy the key immediately (you won't see it again)
   - Store safely in `.env` file

3. **Add to Environment**
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   OPENAI_MODEL=gpt-4-turbo-preview
   OPENAI_MAX_TOKENS=4096
   OPENAI_TEMPERATURE=0.7
   ```

#### Usage in Code

```python
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)

response = client.chat.completions.create(
    model="gpt-4-turbo-preview",
    messages=[
        {"role": "user", "content": "Generate a social media post"}
    ]
)
```

#### Best Practices

- Use environment variables for API keys
- Implement rate limiting
- Cache responses when possible
- Monitor token usage

#### Pricing

Visit [openai.com/pricing](https://openai.com/pricing) for current rates.

---

### Anthropic Integration

#### Setup Steps

1. **Create Anthropic Account**
   - Go to [console.anthropic.com](https://console.anthropic.com)
   - Sign up or log in
   - Navigate to API keys

2. **Create API Key**
   - Click "Create Key"
   - Copy and store in `.env`

3. **Add to Environment**
   ```env
   ANTHROPIC_API_KEY=your-api-key-here
   ANTHROPIC_MODEL=claude-3-opus-20240229
   ```

#### Usage in Code

```python
from anthropic import Anthropic

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

message = client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Create blog post"}
    ]
)
```

---

## Social Media APIs

### Twitter / X Integration

#### Setup Steps

1. **Create Developer Account**
   - Go to [developer.twitter.com](https://developer.twitter.com)
   - Sign up or use existing account
   - Request developer access

2. **Create Application**
   - Go to [Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Click "Create app"
   - Set up app settings

3. **Generate Keys**
   - Go to "Keys and tokens" tab
   - Generate API keys and access tokens
   - Set permissions to "Read and Write"

4. **Add to Environment**
   ```env
   TWITTER_API_KEY=your-api-key
   TWITTER_API_SECRET=your-api-secret
   TWITTER_BEARER_TOKEN=your-bearer-token
   TWITTER_ACCESS_TOKEN=your-access-token
   TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret
   ```

#### Usage in Code

```python
import tweepy

auth = tweepy.OAuthHandler(
    settings.TWITTER_API_KEY, 
    settings.TWITTER_API_SECRET
)
auth.set_access_token(
    settings.TWITTER_ACCESS_TOKEN,
    settings.TWITTER_ACCESS_TOKEN_SECRET
)
api = tweepy.API(auth)

# Post tweet
api.update_status(status="Hello from InfiAgentic!")
```

#### Rate Limits

- Tweet creation: 300 requests per 15 minutes
- Check current limits: Use `tweepy.API().rate_limit_status()`

---

### LinkedIn Integration

#### Setup Steps

1. **Create LinkedIn App**
   - Go to [linkedin.com/developers](https://www.linkedin.com/developers)
   - Sign in with LinkedIn account
   - Click "Create app"
   - Complete app information

2. **Get Credentials**
   - Go to "Auth" tab
   - Copy Client ID and Client Secret
   - Set Authorized redirect URLs

3. **Get Access Token**
   - Use OAuth 2.0 authorization flow
   - Request access token with scopes

4. **Add to Environment**
   ```env
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   LINKEDIN_ACCESS_TOKEN=your-access-token
   ```

#### Usage in Code

```python
import httpx

headers = {
    "Authorization": f"Bearer {settings.LINKEDIN_ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

# Share post
response = httpx.post(
    "https://api.linkedin.com/v2/ugcPosts",
    headers=headers,
    json={
        "author": f"urn:li:person:{person_id}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {...}
    }
)
```

---

### Facebook Integration

#### Setup Steps

1. **Create Facebook App**
   - Go to [facebook.com/developers](https://developers.facebook.com)
   - Click "Create app"
   - Choose Business type

2. **Configure App**
   - Add product "Facebook Login"
   - Configure settings

3. **Get Credentials**
   - Go to Settings > Basic
   - Copy App ID and App Secret
   - Generate access token

4. **Add to Environment**
   ```env
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret
   FACEBOOK_ACCESS_TOKEN=your-access-token
   FACEBOOK_PAGE_ACCESS_TOKEN=your-page-access-token
   ```

---

### Instagram Integration

#### Setup Steps

1. **Use Facebook App**
   - Instagram is integrated through Facebook apps
   - Complete Facebook setup first

2. **Get Business Account**
   - Connect Instagram Business account to Facebook Page
   - Get Instagram Business Account ID

3. **Generate Access Token**
   - Use Facebook Graph API
   - Request `instagram_graph_api` product

4. **Add to Environment**
   ```env
   INSTAGRAM_ACCESS_TOKEN=your-access-token
   INSTAGRAM_BUSINESS_ACCOUNT_ID=your-account-id
   ```

#### Usage in Code

```python
import httpx

# Create post
response = httpx.post(
    f"https://graph.instagram.com/{account_id}/media",
    params={
        "image_url": "https://...",
        "caption": "Check this out!",
        "access_token": settings.INSTAGRAM_ACCESS_TOKEN
    }
)
```

---

## Email Services

### SendGrid Integration

#### Setup Steps

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up for free tier
   - Verify email address

2. **Create API Key**
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Copy key immediately

3. **Add to Environment**
   ```env
   SENDGRID_API_KEY=your-api-key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=InfiAgentic
   ```

4. **Verify Sender**
   - Go to Settings > Sender Authentication
   - Verify domain or single sender

#### Usage in Code

```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

sg = SendGridAPIClient(settings.SENDGRID_API_KEY)

message = Mail(
    from_email=(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME),
    to_emails="recipient@example.com",
    subject="Hello!",
    html_content="<p>This is a test email</p>"
)

response = sg.send(message)
```

#### Rate Limits

- Free tier: 100 emails per day
- Premium: Higher limits based on plan

---

### Mailgun Integration (Alternative)

#### Setup Steps

1. **Create Mailgun Account**
   - Go to [mailgun.com](https://www.mailgun.com)
   - Sign up
   - Add domain

2. **Get API Key**
   - Go to Sending > Domain Settings
   - Copy API key

3. **Add to Environment**
   ```env
   MAILGUN_API_KEY=your-api-key
   MAILGUN_DOMAIN=your-domain.com
   MAILGUN_FROM_EMAIL=noreply@your-domain.com
   ```

#### Usage in Code

```python
import requests

response = requests.post(
    f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
    auth=("api", settings.MAILGUN_API_KEY),
    data={
        "from": settings.MAILGUN_FROM_EMAIL,
        "to": "recipient@example.com",
        "subject": "Hello",
        "text": "This is a test email"
    }
)
```

---

## Communication Services

### Twilio Integration

#### Setup Steps

1. **Create Twilio Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up
   - Get free trial credits

2. **Get Credentials**
   - Go to Console > Account
   - Copy Account SID and Auth Token
   - Purchase phone number (or use trial)

3. **Add to Environment**
   ```env
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_FROM_NUMBER=+1234567890
   ```

#### Usage in Code

```python
from twilio.rest import Client

client = Client(
    settings.TWILIO_ACCOUNT_SID,
    settings.TWILIO_AUTH_TOKEN
)

# Send SMS
message = client.messages.create(
    body="Hello from InfiAgentic!",
    from_=settings.TWILIO_PHONE_NUMBER,
    to="+1987654321"
)

# Make call
call = client.calls.create(
    to="+1987654321",
    from_=settings.TWILIO_FROM_NUMBER,
    url="https://demo.twilio.com/docs/voice.xml"
)
```

#### Pricing

- SMS: ~$0.0075 per message
- Calls: ~$0.013 per minute
- Free trial: $15 credits

---

## Analytics

### Vercel Analytics

#### Setup Steps

1. **Deploy to Vercel** (Optional)
   - Connect GitHub repository
   - Deploy Next.js app

2. **Enable Analytics**
   - Go to project settings
   - Enable Web Analytics

3. **Add to Environment**
   ```env
   NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
   ```

#### Usage in Code

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout() {
  return (
    <html>
      <body>
        <Analytics />
      </body>
    </html>
  );
}
```

---

### Sentry Integration (Error Tracking)

#### Setup Steps

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Sign up
   - Create project

2. **Get DSN**
   - Go to Settings > Client Keys (DSN)
   - Copy DSN

3. **Add to Environment**
   ```env
   SENTRY_DSN=your-sentry-dsn
   ```

#### Usage in Code (Backend)

```python
import sentry_sdk

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    traces_sample_rate=1.0
)
```

---

## Testing APIs

### Using Postman

1. **Import Collection**
   - Open Postman
   - Import `docs/postman-collection.json`
   - Set environment variables

2. **Run Requests**
   - Configure authorization
   - Test endpoints

### Using cURL

```bash
# Test authentication
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test content creation
curl -X POST http://localhost:8000/v1/content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Post","content":"Hello World"}'
```

### Using Python

```python
import httpx

async with httpx.AsyncClient() as client:
    # Test login
    response = await client.post(
        "http://localhost:8000/v1/auth/login",
        json={"email": "test@example.com", "password": "password"}
    )
    token = response.json()["access_token"]
    
    # Test content creation
    response = await client.post(
        "http://localhost:8000/v1/content",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "My Post", "content": "Hello World"}
    )
```

---

## Checklist

Use this checklist to ensure all integrations are properly configured:

### AI Services
- [ ] OpenAI API key added to `.env`
- [ ] Anthropic API key (optional) added to `.env`

### Social Media
- [ ] Twitter API credentials configured
- [ ] LinkedIn API credentials configured
- [ ] Facebook API credentials configured
- [ ] Instagram Business account connected

### Email
- [ ] SendGrid API key added to `.env`
- [ ] Sender email verified in SendGrid

### Communication
- [ ] Twilio account SID and token added to `.env`
- [ ] Twilio phone number configured

### Analytics & Monitoring
- [ ] Sentry DSN added (optional)
- [ ] Vercel Analytics ID added (optional)

### Testing
- [ ] All API endpoints tested in Postman or via cURL
- [ ] Backend running at http://localhost:8000
- [ ] Frontend running at http://localhost:3000

---

## Troubleshooting

### "Invalid API Key"
- Verify key is correct and not expired
- Check it's added to correct `.env` file
- Restart application after changing env vars

### "Authentication Failed"
- Check OAuth tokens are valid
- Verify redirect URIs match configuration
- Regenerate tokens if needed

### "Rate Limit Exceeded"
- Implement exponential backoff
- Cache responses when possible
- Use bulk APIs where available

### "CORS Error"
- Add origin to CORS allowlist
- Check backend CORS settings
- Verify API server is running

---

## Resources

- [OpenAI Docs](https://platform.openai.com/docs)
- [Twitter API Docs](https://developer.twitter.com/en/docs)
- [LinkedIn Docs](https://learn.microsoft.com/en-us/linkedin/shared/api-reference/api-reference)
- [SendGrid Docs](https://docs.sendgrid.com)
- [Twilio Docs](https://www.twilio.com/docs)

For more help, check the main README.md or contact support.
