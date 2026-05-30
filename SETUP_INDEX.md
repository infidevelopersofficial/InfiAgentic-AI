# InfiAgentic Platform - Setup Index

**Quick Navigation for Getting Started**

## 🚀 Start Here

Choose your setup method:

### 1️⃣ **Frontend Only Development**
- ⏱️ Time: 5 minutes
- 📖 Guide: [docs/GETTING_STARTED.md - Frontend Quick Start](./docs/GETTING_STARTED.md#frontend-quick-start)
- 💻 Commands:
  ```bash
  pnpm install
  cp .env.example .env.local
  pnpm dev
  ```
- 🌐 Access: http://localhost:3000

### 2️⃣ **Full Stack with Docker** (Recommended)
- ⏱️ Time: 10-15 minutes
- 📖 Guide: [docs/DOCKER_SETUP.md](./docs/DOCKER_SETUP.md)
- 🐳 Includes: API, PostgreSQL, Redis, Celery, Flower
- 💻 Commands:
  ```bash
  cd backend && cp .env.example .env
  docker-compose up -d
  cd .. && pnpm install && cp .env.example .env.local
  pnpm dev
  ```
- 🌐 Access:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:8000
  - API Docs: http://localhost:8000/docs
  - Flower: http://localhost:5555

### 3️⃣ **Full Stack Manual Setup** (Linux/macOS)
- ⏱️ Time: 20-30 minutes
- 📖 Guide: [docs/GETTING_STARTED.md - Full Stack Setup](./docs/GETTING_STARTED.md#full-stack-setup)
- 🔧 Requires: Python 3.11+, PostgreSQL, Redis

### 4️⃣ **Windows Backend Setup**
- ⏱️ Time: 25-35 minutes
- 📖 Guide: [docs/SETUP-BACKEND-WINDOWS.md](./docs/SETUP-BACKEND-WINDOWS.md)
- 🪟 Windows-specific instructions
- 💡 Pro tip: Use Docker Desktop instead for easier setup

---

## 📚 Documentation Map

| Guide | Purpose | Time | Best For |
|-------|---------|------|----------|
| [GETTING_STARTED.md](./docs/GETTING_STARTED.md) | Complete setup guide | 20 min | Everyone - start here |
| [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) | Commands & troubleshooting | 5 min | Quick lookup |
| [DOCKER_SETUP.md](./docs/DOCKER_SETUP.md) | Docker & Docker Compose | 15 min | Full stack with Docker |
| [SETUP-BACKEND-WINDOWS.md](./docs/SETUP-BACKEND-WINDOWS.md) | Windows backend setup | 30 min | Windows developers |
| [API_INTEGRATIONS.md](./docs/API_INTEGRATIONS.md) | Third-party API setup | 30 min | After initial setup |

---

## ⚙️ Environment Files

### Frontend Environment (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
OPENAI_API_KEY=sk-your-key
```
📄 Template: [.env.example](./.env.example)

### Backend Environment (`backend/.env`)
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/infiagentic
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-32-chars-min
OPENAI_API_KEY=sk-your-key
```
📄 Template: [backend/.env.example](./backend/.env.example)

---

## 🔑 API Keys Required

### Essential (Most Projects)
- ✅ **OpenAI** - For AI content generation
  - Setup: [docs/API_INTEGRATIONS.md#openai-integration](./docs/API_INTEGRATIONS.md#openai-integration)

### Social Media (Optional)
- 📱 **Twitter/X** - For social media posting
- 💼 **LinkedIn** - For professional content
- 📘 **Facebook** - For social campaigns
- 📸 **Instagram** - For visual content

### Email (Optional)
- ✉️ **SendGrid** - Email service
  - Setup: [docs/API_INTEGRATIONS.md#sendgrid-integration](./docs/API_INTEGRATIONS.md#sendgrid-integration)

### Communication (Optional)
- ☎️ **Twilio** - SMS & calls
  - Setup: [docs/API_INTEGRATIONS.md#twilio-integration](./docs/API_INTEGRATIONS.md#twilio-integration)

📖 **Complete API Setup Guide**: [docs/API_INTEGRATIONS.md](./docs/API_INTEGRATIONS.md)

---

## 📋 Setup Checklist

### Before You Start
- [ ] Node.js 20+ installed (`node --version`)
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Python 3.11+ installed (for backend) (`python3 --version`)
- [ ] Repository cloned

### Choose Your Method
- [ ] Method 1: Frontend Only? → Go to [Frontend Quick Start](./docs/GETTING_STARTED.md#frontend-quick-start)
- [ ] Method 2: Docker? → Go to [Docker Setup](./docs/DOCKER_SETUP.md)
- [ ] Method 3: Manual? → Go to [Full Stack Setup](./docs/GETTING_STARTED.md#full-stack-setup)
- [ ] Method 4: Windows? → Go to [Windows Setup](./docs/SETUP-BACKEND-WINDOWS.md)

### Environment Setup
- [ ] Copy `.env.example` to `.env.local` (frontend)
- [ ] Copy `backend/.env.example` to `backend/.env` (if using backend)
- [ ] Add your API keys

### Installation
- [ ] Run `pnpm install` (frontend)
- [ ] Run `pip install -r requirements.txt` (backend, if manual)
- [ ] Run `alembic upgrade head` (database migrations, if manual)

### Testing
- [ ] Frontend at http://localhost:3000
- [ ] Backend at http://localhost:8000 (if running)
- [ ] API Docs at http://localhost:8000/docs (if running)

---

## 🆘 Troubleshooting

### Common Issues

**"Cannot find pnpm"**
```bash
npm install -g pnpm
```
👉 Guide: [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md#troubleshooting-quick-fixes)

**"Cannot connect to database"**
- Check `DATABASE_URL` in `backend/.env`
- Verify PostgreSQL is running
- See: [GETTING_STARTED.md - Troubleshooting](./docs/GETTING_STARTED.md#troubleshooting)

**"Redis connection refused"**
- Start Redis with Docker: `docker run -p 6379:6379 redis:latest`
- Or follow [DOCKER_SETUP.md](./docs/DOCKER_SETUP.md)

**"Port 8000 already in use"**
```bash
uvicorn app.main:app --reload --port 8001
```

👉 Full troubleshooting: [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md#troubleshooting-quick-fixes)

---

## 🎯 Common Workflows

### I want to...

**...work on the frontend only**
1. Read: [GETTING_STARTED.md - Frontend Quick Start](./docs/GETTING_STARTED.md#frontend-quick-start)
2. Run: `pnpm install && pnpm dev`
3. Access: http://localhost:3000

**...set up the full stack with Docker**
1. Read: [DOCKER_SETUP.md](./docs/DOCKER_SETUP.md)
2. Run: `docker-compose up -d` (in backend/)
3. Run: `pnpm dev` (in project root)
4. Access: http://localhost:3000

**...set up the full stack manually**
1. Read: [GETTING_STARTED.md - Full Stack Setup](./docs/GETTING_STARTED.md#full-stack-setup)
2. Follow step-by-step instructions

**...set up on Windows**
1. Read: [SETUP-BACKEND-WINDOWS.md](./docs/SETUP-BACKEND-WINDOWS.md)
2. Or use Docker Desktop instead

**...integrate with OpenAI**
1. Read: [API_INTEGRATIONS.md - OpenAI Integration](./docs/API_INTEGRATIONS.md#openai-integration)
2. Get API key from OpenAI
3. Add to `.env.local` and `backend/.env`

**...integrate with social media APIs**
1. Read: [API_INTEGRATIONS.md - Social Media](./docs/API_INTEGRATIONS.md#social-media-apis)
2. Follow setup steps for each platform
3. Add credentials to `backend/.env`

**...run tests**
- Frontend: `pnpm test`
- Backend: `pytest -v` (in backend/)
- See: [GETTING_STARTED.md - Running Tests](./docs/GETTING_STARTED.md#running-tests)

**...check common commands**
1. Read: [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)
2. Find your command or service

---

## 📞 Support Resources

| Need | Resource |
|------|----------|
| Setup help | [GETTING_STARTED.md](./docs/GETTING_STARTED.md) |
| Quick commands | [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) |
| Docker issues | [DOCKER_SETUP.md](./docs/DOCKER_SETUP.md) |
| API setup | [API_INTEGRATIONS.md](./docs/API_INTEGRATIONS.md) |
| Windows setup | [SETUP-BACKEND-WINDOWS.md](./docs/SETUP-BACKEND-WINDOWS.md) |
| Architecture | [docs/REPO_ARCHITECTURE.md](./docs/REPO_ARCHITECTURE.md) |
| Database schema | [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) |
| API specification | [docs/openapi.yaml](./docs/openapi.yaml) |

---

## �� Ready to Start?

1. **Choose your setup method** above ↑
2. **Read the appropriate guide**
3. **Follow the step-by-step instructions**
4. **Access http://localhost:3000**

---

## 📊 Project Overview

**InfiAgentic** - AI Marketing Automation Platform

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python + async
- **Database**: PostgreSQL + SQLAlchemy
- **Cache/Queue**: Redis + Celery
- **AI**: OpenAI, Anthropic, LangChain
- **Integrations**: Twitter, LinkedIn, Facebook, Instagram, SendGrid, Twilio

### Key Features
- Multi-agent AI system
- Content studio with AI generation
- Social media management
- Email automation
- CRM & lead management
- Workflow automation
- Real-time analytics
- Human-in-the-loop approvals

---

**Version**: 0.1.0  
**Last Updated**: December 2024  
**Status**: Ready for Development

**Next**: Choose your setup method above and follow the guide! 🚀
