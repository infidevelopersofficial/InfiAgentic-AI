# InfiDev Agentic AI Platform - Monorepo Architecture

## Overview

This is the complete monorepo architecture for Infidevelopers' Agentic AI Marketing Automation Platform serving three SaaS products:
- **Jyotishya** - Astrology SaaS
- **HealthPedya.in** - Healthcare SaaS
- **SchooPay.in** - Education Payments SaaS

## Monorepo Structure

\`\`\`
infiagentic/
├── apps/
│   ├── web/                          # Next.js Frontend Dashboard
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── content/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── create/
│   │   │   │   │   └── approval/
│   │   │   │   ├── social/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── calendar/
│   │   │   │   │   └── scheduler/
│   │   │   │   ├── email/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── campaigns/
│   │   │   │   │   ├── templates/
│   │   │   │   │   └── automation/
│   │   │   │   ├── calls/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── campaigns/
│   │   │   │   ├── leads/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── flows/
│   │   │   │   ├── crm/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── contacts/
│   │   │   │   │   └── deals/
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── reports/
│   │   │   │   ├── agents/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── workflows/
│   │   │   │   └── settings/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── team/
│   │   │   │       └── permissions/
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   ├── content/
│   │   │   │   ├── social/
│   │   │   │   ├── email/
│   │   │   │   ├── leads/
│   │   │   │   ├── crm/
│   │   │   │   ├── analytics/
│   │   │   │   ├── agents/
│   │   │   │   └── workflows/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn components
│   │   │   ├── dashboard/
│   │   │   ├── content/
│   │   │   ├── social/
│   │   │   ├── email/
│   │   │   ├── leads/
│   │   │   ├── crm/
│   │   │   ├── analytics/
│   │   │   └── agents/
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   ├── auth.ts
│   │   │   ├── api-client.ts
│   │   │   └── agents/
│   │   └── hooks/
│   │
│   └── api/                           # FastAPI Backend (Reference)
│       ├── app/
│       │   ├── __init__.py
│       │   ├── main.py
│       │   ├── core/
│       │   │   ├── config.py
│       │   │   ├── security.py
│       │   │   └── deps.py
│       │   ├── api/
│       │   │   ├── v1/
│       │   │   │   ├── auth.py
│       │   │   │   ├── content.py
│       │   │   │   ├── social.py
│       │   │   │   ├── email.py
│       │   │   │   ├── leads.py
│       │   │   │   ├── crm.py
│       │   │   │   ├── analytics.py
│       │   │   │   ├── agents.py
│       │   │   │   └── workflows.py
│       │   │   └── deps.py
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── services/
│       │   │   ├── content_service.py
│       │   │   ├── social_service.py
│       │   │   ├── email_service.py
│       │   │   └── agent_orchestrator.py
│       │   └── agents/
│       │       ├── content_agent.py
│       │       ├── engagement_agent.py
│       │       └── sales_agent.py
│       ├── alembic/
│       │   ├── versions/
│       │   └── env.py
│       ├── tests/
│       └── requirements.txt
│
├── packages/
│   ├── database/                      # Shared DB schemas & migrations
│   │   ├── schemas/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── agents/                        # Multi-agent orchestration
│   │   ├── content/
│   │   ├── engagement/
│   │   ├── sales/
│   │   └── orchestrator/
│   ├── shared/                        # Shared utilities
│   │   ├── types/
│   │   ├── constants/
│   │   └── validators/
│   └── ui/                            # Shared UI components
│
├── scripts/                           # Database & utility scripts
│   ├── 001_create_tables.sql
│   ├── 002_create_indexes.sql
│   ├── 003_seed_data.sql
│   └── migrate.ts
│
├── docs/
│   ├── REPO_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPEC.md
│   ├── MULTI_AGENT_DESIGN.md
│   ├── FIGMA_WIREFRAMES.md
│   └── openapi.yaml
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
\`\`\`

## Environment Configuration

### Required Environment Variables

\`\`\`env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/infiagentic
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Social Media APIs
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
INSTAGRAM_ACCESS_TOKEN=...

# Email Services
SENDGRID_API_KEY=...
MAILGUN_API_KEY=...

# Call Marketing
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Products
JYOTISHYA_API_URL=https://api.jyotishya.com
HEALTHPEDYA_API_URL=https://api.healthpedya.in
SCHOOPAY_API_URL=https://api.schoopay.in
\`\`\`

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI |
| State Management | SWR, Zustand |
| Backend | FastAPI (Python 3.11+) / Next.js API Routes |
| Database | PostgreSQL 16, SQLAlchemy 2.0 |
| Caching | Redis, Upstash |
| Task Queue | Celery / Redis Queue |
| AI Orchestration | LangChain, LangGraph |
| Authentication | JWT, OAuth 2.0 |
| CI/CD | GitHub Actions |
| Deployment | Vercel (Frontend), Docker (Backend) |

## Multi-Product Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    InfiAgentic Platform                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Jyotishya  │  │ HealthPedya │  │  SchooPay   │          │
│  │   Product   │  │   Product   │  │   Product   │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Shared Marketing Engine                  │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  Content │ Social │ Email │ Calls │ CRM │ Analytics   │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │              Multi-Agent Orchestration                 │  │
│  ├─────────────┬─────────────────┬─────────────────────┬─┤  │
│  │   Content   │   Engagement    │       Sales         │ │  │
│  │    Agent    │     Agent       │       Agent         │ │  │
│  └─────────────┴─────────────────┴─────────────────────┴─┘  │
└─────────────────────────────────────────────────────────────┘
