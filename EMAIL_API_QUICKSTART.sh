#!/bin/bash
# Email API Quick Start Guide
# Run this to set up and test the Email API locally

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  Email API Quick Start"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# =========================================================================
# CONFIGURATION
# =========================================================================

BACKEND_URL="http://localhost:8000/v1/email"
TOKEN="your_jwt_token_here"  # Replace with actual token

# =========================================================================
# SETUP
# =========================================================================

echo "[1/5] Setting up environment..."

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Email Configuration
SENDGRID_API_KEY=SG.your_key_here
MAILGUN_API_KEY=key-your_key_here
MAILGUN_DOMAIN=mail.example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/email_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
EOF
    echo "✓ .env created - update with your credentials"
else
    echo "✓ .env already exists"
fi

echo ""
echo "[2/5] Starting services..."

# Start PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠ PostgreSQL not found - please install or use Docker"
else
    echo "✓ PostgreSQL available"
fi

# Start Redis
if ! command -v redis-cli &> /dev/null; then
    echo "⚠ Redis not found - please install or use Docker"
else
    echo "✓ Redis available"
fi

# Start backend
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✓ Backend already running on :8000"
else
    echo "Starting backend..."
    cd backend && python -m uvicorn app.main:app --reload &
    sleep 3
    echo "✓ Backend started"
fi

# Start Celery worker
if pgrep -f "celery -A app.celery_app worker" > /dev/null; then
    echo "✓ Celery worker already running"
else
    echo "Starting Celery worker..."
    cd backend && celery -A app.celery_app worker -l info &
    sleep 2
    echo "✓ Celery worker started"
fi

# Start Celery Beat
if pgrep -f "celery -A app.celery_app beat" > /dev/null; then
    echo "✓ Celery Beat already running"
else
    echo "Starting Celery Beat..."
    cd backend && celery -A app.celery_app beat -l info &
    sleep 2
    echo "✓ Celery Beat started"
fi

cd ..

echo ""
echo "[3/5] Testing Email API..."

# Test 1: Create Template
echo ""
echo "Test 1: Create email template"
echo "POST $BACKEND_URL/templates"
curl -s -X POST "$BACKEND_URL/templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Email",
    "subject": "Welcome {{first_name}}!",
    "template_type": "welcome",
    "html_body": "<html><body><h1>Welcome {{first_name}}</h1><p>Thanks for joining us!</p></body></html>",
    "plain_body": "Welcome {{first_name}}\n\nThanks for joining us!",
    "variables": ["first_name"]
  }' | python -m json.tool

# Test 2: List Templates
echo ""
echo "Test 2: List email templates"
echo "GET $BACKEND_URL/templates"
curl -s -X GET "$BACKEND_URL/templates?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# Test 3: Create Campaign
echo ""
echo "Test 3: Create email campaign"
echo "POST $BACKEND_URL/campaigns"
CAMPAIGN=$(curl -s -X POST "$BACKEND_URL/campaigns" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Holiday Promotion",
    "subject": "Exclusive Holiday Offer - 50% Off",
    "html_body": "<html><body><h1>Holiday Sale</h1><p>Save 50% on all products!</p></body></html>",
    "plain_body": "Holiday Sale\nSave 50% on all products!",
    "from_email": "campaigns@company.com",
    "from_name": "Marketing Team"
  }')

echo "$CAMPAIGN" | python -m json.tool
CAMPAIGN_ID=$(echo "$CAMPAIGN" | python -c "import sys, json; print(json.load(sys.stdin)['id'])")

# Test 4: Send Campaign
echo ""
echo "Test 4: Send email campaign to recipients"
echo "POST $BACKEND_URL/campaigns/$CAMPAIGN_ID/send"
curl -s -X POST "$BACKEND_URL/campaigns/$CAMPAIGN_ID/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_ids": ["user1@example.com", "user2@example.com"]
  }' | python -m json.tool

# Test 5: Get Analytics
echo ""
echo "Test 5: Get email analytics"
echo "GET $BACKEND_URL/analytics?days=30"
curl -s -X GET "$BACKEND_URL/analytics?days=30" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# Test 6: Send Test Email
echo ""
echo "Test 6: Send test email"
echo "POST $BACKEND_URL/test-email"
curl -s -X POST "$BACKEND_URL/test-email" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_email": "test@example.com",
    "subject": "Test Email",
    "html_body": "<html><body><h1>This is a test</h1></body></html>"
  }' | python -m json.tool

echo ""
echo "[4/5] Testing Celery Tasks..."

# Check Celery tasks
echo ""
echo "Active Celery tasks:"
celery -A app.celery_app inspect active

echo ""
echo "Scheduled tasks:"
celery -A app.celery_app inspect scheduled

echo ""
echo "[5/5] Setup complete!"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Next Steps"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Update .env with your email provider credentials"
echo "   - SendGrid: SENDGRID_API_KEY=SG.xxxxx"
echo "   - Mailgun: MAILGUN_API_KEY=key-xxxxx"
echo "   - SMTP: SMTP_USER, SMTP_PASSWORD"
echo ""
echo "2. Start services:"
echo "   - Backend:     cd backend && uvicorn app.main:app --reload"
echo "   - Celery:      cd backend && celery -A app.celery_app worker -l info"
echo "   - Beat:        cd backend && celery -A app.celery_app beat -l info"
echo ""
echo "3. Test with your actual JWT token:"
echo "   - Get token from: POST /auth/token with credentials"
echo "   - Update TOKEN variable in this script"
echo ""
echo "4. Configure SendGrid webhooks (optional but recommended):"
echo "   - URL: https://yourdomain.com/v1/email/webhooks/sendgrid"
echo "   - Events: delivered, open, click, bounce, unsubscribe"
echo ""
echo "5. View API documentation:"
echo "   - Swagger UI: http://localhost:8000/docs"
echo "   - Full docs: docs/EMAIL_API.md"
echo ""
echo "6. Monitor tasks:"
echo "   - celery -A app.celery_app events"
echo "   - docker logs celery"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "✓ Email API is ready!"
echo ""
echo "API Endpoints:"
echo "  Templates:     POST/GET/PATCH/DELETE /templates"
echo "  Campaigns:     POST/GET/PATCH/DELETE /campaigns"
echo "  Send:          POST /campaigns/{id}/send"
echo "  Bulk Send:     POST /campaigns/bulk/send"
echo "  Automations:   POST/GET/PATCH/DELETE /automations"
echo "  Analytics:     GET /analytics"
echo "  Test Email:    POST /test-email"
echo ""
echo "Documentation: docs/EMAIL_API.md"
echo "Implementation: EMAIL_API_IMPLEMENTATION.md"
echo ""
