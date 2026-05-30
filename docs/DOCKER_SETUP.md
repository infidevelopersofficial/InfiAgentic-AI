# Docker Compose Setup Guide - InfiAgentic Platform

This guide explains how to run the entire InfiAgentic platform using Docker Compose, which is the recommended approach for development and testing.

## Prerequisites

- **Docker** 20.10+ ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** 2.0+ (usually included with Docker Desktop)
- **Git** for cloning the repository

Verify installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

### Step 1: Clone and Navigate

```bash
git clone https://github.com/infidevelopers/agentic-ai-platform.git
cd agentic-ai-platform/backend
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

### Step 3: Update Environment Variables

Edit `backend/.env` with your API keys and configuration:

```bash
# Most important variables to update:
POSTGRES_PASSWORD=your-secure-password-here
OPENAI_API_KEY=sk-your-openai-key-here
SECRET_KEY=your-secret-key-min-32-characters

# Optional but recommended:
TWITTER_BEARER_TOKEN=your-twitter-token
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
```

### Step 4: Start All Services

```bash
# Start all services in the background
docker-compose up -d

# Or start with logs visible (remove -d flag)
docker-compose up

# Watch logs in real-time
docker-compose logs -f
```

### Step 5: Verify Services Are Running

```bash
# Check all services
docker-compose ps

# Expected output:
# NAME                    STATUS
# infiagentic-api         Up
# infiagentic-celery-worker  Up
# db                      Up (healthy)
# redis                   Up (healthy)
```

### Step 6: Run Database Migrations

```bash
# Run migrations (automatically done on startup, but you can run manually)
docker-compose exec api alembic upgrade head

# Verify tables created
docker-compose exec db psql -U postgres -d infiagentic -c "\dt"
```

## Accessing Services

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Next.js web interface |
| **FastAPI** | http://localhost:8000 | REST API |
| **Swagger Docs** | http://localhost:8000/docs | Interactive API documentation |
| **ReDoc** | http://localhost:8000/redoc | Alternative API documentation |
| **Flower** | http://localhost:5555 | Celery task monitoring |
| **PostgreSQL** | localhost:5432 | Database (via psql) |
| **Redis** | localhost:6379 | Cache (via redis-cli) |

## Common Tasks

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f db
docker-compose logs -f redis
```

### Access PostgreSQL Database

```bash
# Using psql
docker-compose exec db psql -U postgres -d infiagentic

# Or use pgAdmin (optional - add to docker-compose.yml)
# Available at http://localhost:5050
```

### Access Redis

```bash
# Using redis-cli
docker-compose exec redis redis-cli

# Common commands:
# KEYS *           - List all keys
# FLUSHDB          - Clear current database
# FLUSHALL         - Clear all databases
```

### Run Backend Tests

```bash
# Run all tests
docker-compose exec api pytest -v

# Run specific test file
docker-compose exec api pytest tests/test_auth.py -v

# Run with coverage
docker-compose exec api pytest --cov=app tests/
```

### View Celery Tasks

```bash
# View active tasks in Flower UI
# http://localhost:5555

# Or via CLI
docker-compose exec celery-worker celery -A app.celery_app inspect active
```

### Create Superuser (Optional)

```bash
# If your app has user management
docker-compose exec api python -c "from app.core.security import get_password_hash; print(get_password_hash('password'))"
```

## Troubleshooting

### Services Not Starting

```bash
# Check for errors
docker-compose logs

# Restart specific service
docker-compose restart api

# Rebuild images
docker-compose up -d --build
```

### Database Connection Error

```bash
# Check if database is healthy
docker-compose ps db

# View database logs
docker-compose logs db

# Wait for database to be ready and restart
docker-compose restart db
sleep 5
docker-compose restart api
```

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Or change ports in docker-compose.yml:
# Change "8000:8000" to "8001:8000" for API, etc.
```

### Reset Everything

```bash
# Stop and remove all containers
docker-compose down

# Remove volumes (clears database)
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Environment Variables Reference

### Critical Variables

```env
# Database
POSTGRES_PASSWORD=secure-password
DATABASE_URL=postgresql+asyncpg://postgres:secure-password@db:5432/infiagentic

# Redis
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0

# Security
SECRET_KEY=your-secret-key-minimum-32-characters-long
ALGORITHM=HS256

# AI Services
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=your-key
```

### Optional but Recommended

```env
# Social Media
TWITTER_BEARER_TOKEN=
LINKEDIN_CLIENT_ID=
FACEBOOK_APP_ID=

# Email
SENDGRID_API_KEY=

# Communication
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Monitoring
SENTRY_DSN=
NEWRELIC_LICENSE_KEY=
```

## Running Frontend

The frontend (Next.js) should be run separately:

```bash
# In a new terminal at project root
cd /path/to/agentic-ai-platform

# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local

# Update with your backend URL and API keys
nano .env.local

# Start development server
pnpm dev
```

Frontend will be available at http://localhost:3000

## Production Deployment

For production deployment:

1. **Update Environment Variables**
   ```bash
   ENVIRONMENT=production
   DEBUG=false
   POSTGRES_PASSWORD=strong-secure-password
   SECRET_KEY=very-long-random-string
   ```

2. **Security Hardening**
   ```env
   CORS_ORIGINS=["https://yourdomain.com"]
   CORS_ALLOW_CREDENTIALS=true
   ```

3. **Scale Services**
   ```bash
   # Run multiple API workers
   docker-compose up --scale api=3 -d
   
   # Run multiple Celery workers
   docker-compose up --scale celery-worker=2 -d
   ```

4. **Use Managed Services**
   - Replace PostgreSQL with AWS RDS
   - Replace Redis with AWS ElastiCache
   - Use Kubernetes instead of Docker Compose

## Next Steps

1. Create `.env` file with your configuration
2. Run `docker-compose up -d`
3. Access API at http://localhost:8000/docs
4. Run frontend with `pnpm dev` in another terminal
5. Start building and testing!

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
