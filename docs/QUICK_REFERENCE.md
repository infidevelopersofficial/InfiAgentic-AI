# Quick Reference Guide

A quick lookup for common commands and setup steps.

## Installation Checklist

- [ ] Node.js 20+ installed: `node --version`
- [ ] pnpm installed: `pnpm --version`
- [ ] Python 3.11+ installed: `python3 --version`
- [ ] PostgreSQL installed: `psql --version`
- [ ] Redis installed or Docker running
- [ ] Repository cloned

## One-Line Setup

### Frontend Only
```bash
pnpm install && cp .env.example .env.local && pnpm dev
```

### Full Stack with Docker
```bash
cd backend && cp .env.example .env && docker-compose up -d && cd .. && pnpm install && cp .env.example .env.local && pnpm dev
```

### Full Stack Manual
```bash
# Terminal 1 - Frontend
pnpm install && cp .env.example .env.local && pnpm dev

# Terminal 2 - Backend
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cp .env.example .env && alembic upgrade head && uvicorn app.main:app --reload

# Terminal 3 - Celery (Optional)
cd backend && source venv/bin/activate && celery -A app.celery_app worker --loglevel=info
```

## Environment Variables

### Minimum Required

**`.env.local` (Frontend)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
OPENAI_API_KEY=sk-...
```

**`backend/.env` (Backend)**
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/infiagentic
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here-32-chars-min
OPENAI_API_KEY=sk-...
```

## Common Commands

### Frontend

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Backend

```bash
# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Create migration
alembic revision --autogenerate -m "description"

# Start dev server
uvicorn app.main:app --reload

# Run tests
pytest -v

# Run specific test
pytest tests/test_auth.py -v

# Run with coverage
pytest --cov=app tests/
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api

# Execute command in container
docker-compose exec api bash

# Run migrations in container
docker-compose exec api alembic upgrade head

# Check service status
docker-compose ps
```

### Database

```bash
# Connect to PostgreSQL
psql -U postgres -d infiagentic

# List tables
\dt

# Describe table
\d table_name

# Exit psql
\q
```

### Redis

```bash
# Connect to Redis
redis-cli

# List all keys
KEYS *

# Get value
GET key_name

# Delete key
DEL key_name

# Flush database
FLUSHDB
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Flower | http://localhost:5555 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## File Locations

| File | Purpose |
|------|---------|
| `.env.example` | Frontend env template |
| `.env.local` | Frontend env (local) |
| `backend/.env.example` | Backend env template |
| `backend/.env` | Backend env (local) |
| `package.json` | Frontend dependencies |
| `backend/requirements.txt` | Backend dependencies |
| `backend/docker-compose.yml` | Docker services |
| `tsconfig.json` | TypeScript config |
| `backend/alembic/versions/` | Database migrations |

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| "command not found: pnpm" | `npm install -g pnpm` |
| "Cannot connect to database" | Check DATABASE_URL in `.env` |
| "Redis connection refused" | Start Redis or use Docker |
| "Port 8000 already in use" | `uvicorn app.main:app --reload --port 8001` |
| "ModuleNotFoundError" | Activate venv: `source venv/bin/activate` |
| "API not responding" | Verify backend running: `http://localhost:8000/docs` |
| "Migrations failed" | Check database exists: `psql -U postgres -l` |

## Getting Help

1. Check [docs/GETTING_STARTED.md](./GETTING_STARTED.md)
2. Check [docs/API_INTEGRATIONS.md](./API_INTEGRATIONS.md)
3. Check [docs/DOCKER_SETUP.md](./DOCKER_SETUP.md)
4. Check GitHub issues
5. Email: api@infidevelopers.com

## API Integration Setup

Quick links to set up third-party services:

- [OpenAI](./API_INTEGRATIONS.md#openai-integration) - AI content generation
- [Twitter API](./API_INTEGRATIONS.md#twitter--x-integration) - Social media posting
- [LinkedIn API](./API_INTEGRATIONS.md#linkedin-integration) - Professional network
- [SendGrid](./API_INTEGRATIONS.md#sendgrid-integration) - Email service
- [Twilio](./API_INTEGRATIONS.md#twilio-integration) - Phone/SMS service

See [docs/API_INTEGRATIONS.md](./API_INTEGRATIONS.md) for full details.

## Development Workflow

1. **Create feature branch**: `git checkout -b feature/name`
2. **Install deps**: `pnpm install` (frontend) / `pip install -r requirements.txt` (backend)
3. **Make changes**: Edit files as needed
4. **Run tests**: `pnpm test` / `pytest -v`
5. **Commit changes**: `git commit -m "feat: description"`
6. **Push branch**: `git push origin feature/name`
7. **Create PR**: Submit on GitHub

## Project Structure

```
agentic-ai-platform/
├── app/                    # Next.js Frontend
├── backend/               # FastAPI Backend
├── components/            # React Components
├── docs/                  # Documentation
├── lib/                   # Utilities & Agents
├── public/                # Static Files
├── .env.example           # Frontend env template
├── package.json           # Frontend deps
└── README.md              # Project overview
```

## Next Steps

1. ✅ Read [docs/GETTING_STARTED.md](./GETTING_STARTED.md)
2. ✅ Copy `.env.example` files and fill in API keys
3. ✅ Run `pnpm install` (frontend)
4. ✅ Run `pip install -r requirements.txt` (backend, optional)
5. ✅ Start development: `pnpm dev`
6. ✅ Access at http://localhost:3000

Enjoy building with InfiAgentic! 🚀
