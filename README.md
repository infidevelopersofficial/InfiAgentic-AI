# InfiAgentic - AI Marketing Automation Platform

A comprehensive AI-powered marketing automation platform with multi-agent orchestration for content creation, social media management, email campaigns, CRM, lead flows, call marketing, and analytics.

## Features

- **Multi-Agent AI System** - Orchestrate multiple AI agents for content, social, email, and sales tasks
- **Content Studio** - AI-powered content generation with SEO optimization
- **Social Media Management** - Schedule and publish across Twitter, LinkedIn, Facebook, Instagram
- **Email Automation** - Create and automate personalized email campaigns
- **CRM & Lead Management** - Track leads through the pipeline with AI-powered scoring
- **Lead Flows** - Visual workflow builder for lead nurturing automation
- **Call Marketing** - Twilio-powered call tracking and automation
- **Workflow Automation** - Build powerful automation workflows with drag-and-drop
- **Analytics Dashboard** - Real-time insights and performance tracking
- **Human-in-the-Loop** - Approval queues for quality control

## Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                 │
│            Next.js API Routes / FastAPI Backend                  │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  PostgreSQL   │    │     Redis     │    │  AI Services  │
│   Database    │    │  Cache/Queue  │    │  OpenAI/etc   │
└───────────────┘    └───────────────┘    └───────────────┘
\`\`\`

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI**: React 19, TypeScript, Tailwind CSS v4
- **Components**: shadcn/ui, Radix UI primitives
- **State**: SWR for data fetching

### Backend (FastAPI - Optional)
- **Framework**: FastAPI with async/await
- **Database**: PostgreSQL with SQLAlchemy 2.0 (async)
- **Migrations**: Alembic
- **Queue**: Celery with Redis
- **Auth**: JWT with bcrypt password hashing

### AI & Integrations
- **AI SDK**: Vercel AI SDK with OpenAI, Anthropic
- **Social**: Twitter, LinkedIn, Facebook, Instagram APIs
- **Email**: SendGrid, Mailgun
- **Calls**: Twilio

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- PostgreSQL 16+ (for full backend)
- Redis 7+ (for Celery tasks)

### Frontend Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/infidevelopers/agentic-ai-platform.git
cd agentic-ai-platform

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Start the development server
pnpm dev
\`\`\`

### FastAPI Backend Installation

\`\`\`bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload
\`\`\`

### Docker Deployment

\`\`\`bash
cd backend
docker-compose up -d
\`\`\`

This starts:
- FastAPI API server (port 8000)
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Celery worker & beat scheduler
- Flower monitoring (port 5555)

## Project Structure

\`\`\`
├── app/                          # Next.js App Router
│   ├── api/                      # Next.js API routes
│   ├── dashboard/                # Dashboard pages
│   │   ├── content/              # Content studio
│   │   ├── social/               # Social media
│   │   ├── email/                # Email campaigns
│   │   ├── crm/                  # CRM & contacts
│   │   ├── leads/                # Lead management
│   │   ├── workflows/            # Automation workflows
│   │   ├── agents/               # AI agents
│   │   ├── analytics/            # Analytics dashboard
│   │   └── settings/             # Settings
│   └── page.tsx                  # Landing page
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/               # API routers
│   │   ├── core/                 # Config, DB, Security
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic schemas
│   │   └── tasks/                # Celery tasks
│   ├── alembic/                  # Database migrations
│   ├── tests/                    # Test suite
│   ├── Dockerfile
│   └── docker-compose.yml
├── components/                   # React components
│   ├── dashboard/                # Dashboard components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utilities
│   ├── agents/                   # AI agent implementations
│   │   ├── orchestrator.ts       # Main orchestrator
│   │   ├── content-agent.ts      # Content generation
│   │   ├── social-agent.ts       # Social media
│   │   └── email-agent.ts        # Email campaigns
│   └── types.ts                  # TypeScript types
├── scripts/                      # SQL scripts
├── docs/                         # Documentation
│   ├── openapi.yaml              # API specification
│   ├── REPO_ARCHITECTURE.md      # Architecture docs
│   ├── DATABASE_SCHEMA.md        # Database schema
│   ├── MULTI_AGENT_DESIGN.md     # Agent design
│   └── FIGMA_WIREFRAMES.md       # Wireframe specs
└── .github/workflows/            # CI/CD pipelines
\`\`\`

## API Documentation

### Next.js API Routes
Available at `/api/*` when running the Next.js frontend.

### FastAPI Backend
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: `docs/openapi.yaml`

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/auth/register` | POST | Register new user |
| `/v1/auth/login` | POST | Login user |
| `/v1/content` | GET/POST | List/Create content |
| `/v1/leads` | GET/POST | List/Create leads |
| `/v1/social/posts` | GET/POST | List/Create social posts |
| `/v1/email/campaigns` | GET/POST | List/Create campaigns |
| `/v1/agents` | GET/POST | List/Create AI agents |
| `/v1/workflows` | GET/POST | List/Create workflows |
| `/v1/analytics/dashboard` | GET | Get dashboard metrics |

## Environment Variables

See `.env.example` for frontend and `backend/.env.example` for FastAPI backend.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing key (required in production)
- `OPENAI_API_KEY` - OpenAI API key
- `REDIS_URL` - Redis connection string

## Testing

### Frontend
\`\`\`bash
pnpm test
\`\`\`

### Backend

```bash
cd backend
source .venv/bin/activate
pytest -v
```

## Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend Options
1. **Railway/Render**: Deploy Dockerfile
2. **AWS ECS**: Use docker-compose for orchestration
3. **DigitalOcean App Platform**: Deploy from GitHub

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

Proprietary - InfiDevelopers

## Support

- Email: api@infidevelopers.com
- Documentation: https://docs.infidevelopers.com
