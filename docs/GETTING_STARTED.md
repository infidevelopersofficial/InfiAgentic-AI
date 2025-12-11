# Getting Started with InfiAgentic Platform

Complete setup guide for developing and deploying the InfiAgentic AI Marketing Automation Platform.

## Quick Navigation

- **Frontend Only**: [Frontend Quick Start](#frontend-quick-start)
- **Full Stack (Recommended)**: [Full Stack Setup](#full-stack-setup)
- **Docker Setup**: [See docs/DOCKER_SETUP.md](./docs/DOCKER_SETUP.md)
- **Windows Backend Setup**: [See docs/SETUP-BACKEND-WINDOWS.md](./docs/SETUP-BACKEND-WINDOWS.md)
- **API Integrations**: [See docs/API_INTEGRATIONS.md](./docs/API_INTEGRATIONS.md)

---

## System Requirements

### Minimum Requirements
- **Node.js**: 20.x LTS or higher
- **pnpm**: 8.x or higher
- **RAM**: 4GB
- **Disk Space**: 2GB

### For Full Stack Development
- **Python**: 3.11+
- **PostgreSQL**: 14+
- **Redis**: 6+
- **Docker** (recommended) or Docker Desktop

### For Production
- **Docker** & **Docker Compose**
- **Kubernetes** (optional for scaling)

---

## Frontend Quick Start

### For Frontend Development Only

If you only want to work on the UI/frontend:

```bash
# Navigate to project root
cd /path/to/agentic-ai-platform

# Install dependencies (first time)
pnpm install

# Create environment file
cp .env.example .env.local

# Start development server
pnpm dev
```

**Frontend available at**: http://localhost:3000

#### Environment Variables (Frontend)

Minimal `.env.local` for frontend-only development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
OPENAI_API_KEY=sk-your-key-here
```

---

## Full Stack Setup

### Recommended: Using Docker Compose

#### Prerequisites
- Docker Desktop installed
- 4GB+ available RAM

#### Steps

```bash
# 1. Navigate to backend
cd /path/to/agentic-ai-platform/backend

# 2. Create environment file
cp .env.example .env

# 3. Update .env with your API keys (at minimum):
#    - POSTGRES_PASSWORD
#    - OPENAI_API_KEY
#    - SECRET_KEY

# 4. Start all services
docker-compose up -d

# 5. Check services are running
docker-compose ps

# 6. In another terminal, start frontend
cd /path/to/agentic-ai-platform
pnpm install
cp .env.example .env.local
pnpm dev
```

**Services available at:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Flower (Task Monitor): http://localhost:5555

---

### Manual Setup (macOS/Linux)

#### Step 1: Frontend Setup

```bash
cd /path/to/agentic-ai-platform

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Required keys in .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# OPENAI_API_KEY=sk-...

# Start development server (Terminal 1)
pnpm dev
```

#### Step 2: Backend Setup

```bash
# Terminal 2
cd /path/to/agentic-ai-platform/backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Required keys in .env:
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/infiagentic
# REDIS_URL=redis://localhost:6379/0
# OPENAI_API_KEY=sk-...
# SECRET_KEY=your-secret-key-32-chars-min
```

#### Step 3: Database Setup

```bash
# Terminal 2 (with venv activated)

# Run migrations
alembic upgrade head

# Verify tables created
psql -U postgres -d infiagentic -c "\dt"
```

#### Step 4: Start Backend

```bash
# Terminal 2 (with venv activated)
uvicorn app.main:app --reload
```

Backend available at: http://localhost:8000

#### Step 5: Start Celery (Optional)

```bash
# Terminal 3
cd /path/to/agentic-ai-platform/backend
source venv/bin/activate
celery -A app.celery_app worker --loglevel=info

# Terminal 4 (Optional - Task Monitor)
celery -A app.celery_app flower
# Available at http://localhost:5555
```

---

## Environment Variables

### Critical Variables

These MUST be set for the application to work:

**Backend (.env)**
```env
ENVIRONMENT=development
SECRET_KEY=your-secret-key-minimum-32-characters
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/infiagentic
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=sk-your-openai-api-key
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
OPENAI_API_KEY=sk-your-openai-api-key
```

### Optional Variables

See `.env.example` and `backend/.env.example` for complete lists including:
- Social media API keys (Twitter, LinkedIn, Facebook, Instagram)
- Email service credentials (SendGrid, Mailgun)
- Communication services (Twilio)
- Monitoring tools (Sentry, New Relic)

---

## Running Tests

### Frontend Tests

```bash
cd /path/to/agentic-ai-platform
pnpm test
```

### Backend Tests

```bash
cd /path/to/agentic-ai-platform/backend

# Activate venv if not already
source venv/bin/activate

# Run all tests
pytest -v

# Run specific test file
pytest tests/test_auth.py -v

# Run with coverage
pytest --cov=app tests/
```

---

## Project Structure Overview

```
agentic-ai-platform/
├── app/                          # Next.js frontend (React + TypeScript)
│   ├── api/                      # Next.js API routes
│   ├── dashboard/                # Main dashboard pages
│   │   ├── content/              # Content studio
│   │   ├── social/               # Social media management
│   │   ├── email/                # Email campaigns
│   │   ├── crm/                  # CRM & contacts
│   │   ├── leads/                # Lead management
│   │   ├── workflows/            # Automation workflows
│   │   ├── agents/               # AI agents management
│   │   ├── analytics/            # Analytics dashboard
│   │   └── settings/             # Application settings
│   └── page.tsx                  # Landing/home page
│
├── backend/                      # FastAPI backend (Python)
│   ├── app/
│   │   ├── api/v1/               # REST API endpoints
│   │   │   ├── auth.py          # Authentication
│   │   │   ├── content.py       # Content endpoints
│   │   │   ├── social.py        # Social media
│   │   │   ├── email.py         # Email campaigns
│   │   │   ├── leads.py         # Lead management
│   │   │   ├── crm.py           # CRM
│   │   │   ├── workflows.py     # Workflows
│   │   │   └── agents.py        # AI agents
│   │   ├── core/                 # Core utilities
│   │   │   ├── config.py        # Settings/configuration
│   │   │   ├── database.py      # Database connection
│   │   │   ├── security.py      # Authentication/security
│   │   │   └── middleware.py    # Custom middleware
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── tasks/                # Celery async tasks
│   │   └── main.py              # Application entry point
│   ├── alembic/                  # Database migrations
│   ├── tests/                    # Backend tests
│   ├── Dockerfile               # Container image
│   ├── docker-compose.yml       # Multi-container orchestration
│   ├── requirements.txt         # Python dependencies
│   └── pytest.ini              # Test configuration
│
├── components/                   # React components
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── header.tsx           # Header component
│   │   ├── sidebar.tsx          # Sidebar navigation
│   │   ├── agent-status-card.tsx
│   │   ├── analytics-chart.tsx
│   │   └── ... (other dashboard components)
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx           # Base components
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       └── ... (50+ UI components)
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts            # Mobile detection hook
│   └── use-toast.ts             # Toast notifications hook
│
├── lib/                          # Utility functions and AI agents
│   ├── agents/                   # AI agent implementations
│   │   ├── orchestrator.ts      # Main agent orchestrator
│   │   ├── content-agent.ts     # Content generation agent
│   │   ├── social-agent.ts      # Social media agent
│   │   └── email-agent.ts       # Email campaign agent
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Helper functions
│
├── public/                       # Static assets
├── styles/                       # Global stylesheets
├── docs/                         # Documentation
│   ├── DOCKER_SETUP.md          # Docker setup guide
│   ├── SETUP-BACKEND-WINDOWS.md # Windows backend setup
│   ├── API_INTEGRATIONS.md      # Third-party API setup
│   ├── DATABASE_SCHEMA.md       # Database schema
│   ├── MULTI_AGENT_DESIGN.md    # AI agent architecture
│   ├── openapi.yaml             # API specification
│   └── postman-collection.json  # Postman API collection
│
├── scripts/                      # SQL scripts
│   ├── 001_create_tables.sql
│   ├── 002_create_indexes.sql
│   └── 003_seed_data.sql
│
├── .env.example                 # Frontend env template
├── .env.local                   # Frontend env (local - git ignored)
├── next.config.mjs              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Frontend dependencies
├── pnpm-lock.yaml              # Dependency lock file
├── README.md                   # Project overview
├── setup-dev.sh               # Linux/macOS setup script
└── setup-dev-windows.sh       # Windows setup script
```

---

## API Documentation

### Available Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/auth/register` | POST | Register new user |
| `/v1/auth/login` | POST | User login |
| `/v1/auth/refresh` | POST | Refresh access token |
| `/v1/auth/logout` | POST | User logout |
| `/v1/content` | GET/POST | List/create content |
| `/v1/content/{id}` | GET/PUT/DELETE | Get/update/delete content |
| `/v1/social/posts` | GET/POST | List/create social posts |
| `/v1/social/schedule` | POST | Schedule social post |
| `/v1/email/campaigns` | GET/POST | List/create email campaigns |
| `/v1/email/send` | POST | Send email campaign |
| `/v1/leads` | GET/POST | List/create leads |
| `/v1/leads/{id}` | GET/PUT/DELETE | Lead management |
| `/v1/crm/contacts` | GET/POST | CRM contact management |
| `/v1/workflows` | GET/POST | Create/manage workflows |
| `/v1/agents` | GET/POST | List/create AI agents |
| `/v1/analytics/dashboard` | GET | Dashboard metrics |
| `/v1/analytics/reports` | GET | Generate reports |

### Interactive Documentation

When backend is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## Troubleshooting

### "pnpm: command not found"
```bash
# Install pnpm
npm install -g pnpm

# Verify
pnpm --version
```

### "Cannot connect to database"
```bash
# Verify PostgreSQL is running
psql -U postgres -d infiagentic -c "SELECT 1"

# Check connection string in .env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/infiagentic
```

### "Redis connection refused"
```bash
# Start Redis (Docker)
docker run -p 6379:6379 redis:latest

# Or if installed locally
redis-server
```

### "Port 8000 already in use"
```bash
# Find process using port
lsof -i :8000

# Or use different port
uvicorn app.main:app --reload --port 8001
```

### "ModuleNotFoundError" in Python
```bash
# Verify venv is activated
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend not connecting to backend
1. Verify backend is running: http://localhost:8000/docs
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check CORS settings in backend `.env`
4. Restart frontend: `pnpm dev`

---

## Development Best Practices

### Code Style

#### Frontend
```bash
# Lint TypeScript
pnpm lint

# Format code
pnpm format
```

#### Backend
```bash
# Lint Python
pylint app

# Format code
black app

# Type checking
mypy app
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: describe your change"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request on GitHub
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "add new table"

# Review generated migration file
cat backend/alembic/versions/xxx_add_new_table.py

# Apply migration
alembic upgrade head
```

---

## Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
pnpm install -g vercel

# Deploy
vercel
```

### Backend (Docker)

```bash
# Build image
docker build -t infiagentic-api:latest backend/

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e OPENAI_API_KEY=sk-... \
  infiagentic-api:latest
```

### Full Stack (Docker Compose)

```bash
cd backend
docker-compose -f docker-compose.yml up -d
```

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### API Integration Guides
- See [docs/API_INTEGRATIONS.md](./docs/API_INTEGRATIONS.md)

### Architecture Documentation
- See [docs/REPO_ARCHITECTURE.md](./docs/REPO_ARCHITECTURE.md)
- See [docs/MULTI_AGENT_DESIGN.md](./docs/MULTI_AGENT_DESIGN.md)
- See [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)

### Getting Help
- Check existing GitHub issues
- Create a new issue with details
- Email: api@infidevelopers.com

---

## License

Proprietary - InfiDevelopers

---

**Last Updated**: December 2024
**Version**: 0.1.0
