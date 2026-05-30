# 🚀 InfiAgentic Platform - Start Here

**Everything you need to get the project running**

---

## 📍 You Are Here

This is your entry point. Start with this file, then follow the guides for your situation.

---

## ⚡ 30-Second Quick Start

```bash
# Frontend only (5 min)
pnpm install && cp .env.example .env.local && pnpm dev
# → Access: http://localhost:3000

# OR Full stack with Docker (15 min) - RECOMMENDED
cd backend && cp .env.example .env && docker-compose up -d && cd .. && pnpm install && cp .env.example .env.local && pnpm dev
# → Frontend: http://localhost:3000
# → Backend: http://localhost:8000/docs
```

---

## 🎯 Choose Your Path

### 🟢 I just want to see the frontend
1. **Time**: 5 minutes
2. **Read**: [Frontend Quick Start](./docs/GETTING_STARTED.md#frontend-quick-start)
3. **Do**: Copy, install, run
4. **Access**: http://localhost:3000

### 🟡 I want to run the full stack with Docker
1. **Time**: 15 minutes (RECOMMENDED)
2. **Read**: [docs/DOCKER_SETUP.md](./docs/DOCKER_SETUP.md)
3. **Requires**: Docker Desktop
4. **Access**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000/docs
   - Celery Monitor: http://localhost:5555

### 🔴 I want to set up everything manually
1. **Time**: 30 minutes
2. **Read**: [docs/GETTING_STARTED.md - Full Stack Setup](./docs/GETTING_STARTED.md#full-stack-setup)
3. **Requires**: Python 3.11+, PostgreSQL, Redis
4. **For**: Advanced users

### 🔵 I'm on Windows
1. **Time**: 30 minutes
2. **Option A**: Use Docker Desktop (easier)
   - Read: [docs/DOCKER_SETUP.md](./docs/DOCKER_SETUP.md)
3. **Option B**: Manual setup
   - Read: [docs/SETUP-BACKEND-WINDOWS.md](./docs/SETUP-BACKEND-WINDOWS.md)

---

## 📋 Before You Start

Check you have:
- ✅ Node.js 20+ (run: `node --version`)
- ✅ pnpm (run: `pnpm --version` or install: `npm install -g pnpm`)
- ✅ Git (for cloning repo)

For backend (optional):
- ✅ Python 3.11+
- ✅ Docker (for database/Redis) OR PostgreSQL + Redis installed

---

## 🗺️ Documentation Map

| File | Purpose | Read If... |
|------|---------|-----------|
| **SETUP_INDEX.md** | Detailed navigation | You need more options |
| **docs/GETTING_STARTED.md** | Complete setup guide | You're doing manual setup |
| **docs/DOCKER_SETUP.md** | Docker & Docker Compose | You're using Docker (RECOMMENDED) |
| **docs/SETUP-BACKEND-WINDOWS.md** | Windows backend setup | You're on Windows |
| **docs/QUICK_REFERENCE.md** | Commands & troubleshooting | You need quick lookup |
| **docs/API_INTEGRATIONS.md** | API key setup | You need OpenAI/Twitter/etc. |
| **SETUP_SUMMARY.md** | What was created | You want overview of changes |

---

## 🔑 Environment Setup

### Minimum for Frontend
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
OPENAI_API_KEY=sk-your-openai-key
```

### Minimum for Backend
```env
# backend/.env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/infiagentic
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-min-32-chars
OPENAI_API_KEY=sk-your-openai-key
```

📄 Full templates available in:
- [.env.example](./.env.example)
- [backend/.env.example](./backend/.env.example)

---

## ✅ Step-by-Step for Frontend Only

```bash
# 1. Install dependencies
pnpm install

# 2. Create environment file
cp .env.example .env.local

# 3. Edit .env.local and add your keys
# NEXT_PUBLIC_API_URL=http://localhost:8000
# OPENAI_API_KEY=sk-...

# 4. Start development server
pnpm dev

# 5. Open browser
# http://localhost:3000
```

---

## ✅ Step-by-Step for Full Stack with Docker

```bash
# 1. Navigate to backend
cd backend

# 2. Create environment file
cp .env.example .env

# 3. Edit backend/.env with your keys
# POSTGRES_PASSWORD=your-password
# OPENAI_API_KEY=sk-...
# SECRET_KEY=your-secret-key

# 4. Start all services
docker-compose up -d

# 5. Back to project root
cd ..

# 6. Install frontend dependencies
pnpm install

# 7. Create frontend environment
cp .env.example .env.local

# 8. Edit .env.local with your keys
# NEXT_PUBLIC_API_URL=http://localhost:8000
# OPENAI_API_KEY=sk-...

# 9. Start frontend
pnpm dev

# 10. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

---

## 🐛 Troubleshooting

### "pnpm: command not found"
```bash
npm install -g pnpm
```

### "Cannot connect to backend"
- Is backend running? Check: http://localhost:8000/docs
- Check NEXT_PUBLIC_API_URL in .env.local
- Verify CORS settings in backend/.env

### "Port 8000 already in use"
```bash
# Find process
lsof -i :8000

# Or use different port
uvicorn app.main:app --reload --port 8001
```

### More troubleshooting
👉 See: [docs/QUICK_REFERENCE.md#troubleshooting-quick-fixes](./docs/QUICK_REFERENCE.md#troubleshooting-quick-fixes)

---

## 🎓 Learning Path

1. **Get it running** (this file)
2. **Explore the code** (understand structure)
3. **Read architecture docs** (understand design)
4. **Set up API keys** ([docs/API_INTEGRATIONS.md](./docs/API_INTEGRATIONS.md))
5. **Start developing** (make changes)

---

## 🔗 Useful Links

- **Frontend Docs**: https://nextjs.org/docs
- **Backend Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 💬 Need Help?

1. Check [docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) for common commands
2. Check [docs/GETTING_STARTED.md#troubleshooting](./docs/GETTING_STARTED.md#troubleshooting)
3. Search GitHub issues
4. Email: api@infidevelopers.com

---

## 🚀 Ready?

**Pick one:**

- 👉 [Frontend Quick Start](./docs/GETTING_STARTED.md#frontend-quick-start) (5 min)
- 👉 [Docker Setup](./docs/DOCKER_SETUP.md) (15 min) ⭐ RECOMMENDED
- 👉 [Full Stack Manual](./docs/GETTING_STARTED.md#full-stack-setup) (30 min)
- 👉 [Windows Setup](./docs/SETUP-BACKEND-WINDOWS.md) (30 min)
- 👉 [Detailed Navigation](./SETUP_INDEX.md) (all options)

---

**Version**: 0.1.0  
**Status**: Ready for Development  
**Last Updated**: December 2024

Let's build something amazing! ��
