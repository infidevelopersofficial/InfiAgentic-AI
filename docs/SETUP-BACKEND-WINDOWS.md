# Backend Setup Guide - Windows

This guide provides step-by-step instructions for setting up the FastAPI backend on Windows.

## Prerequisites

### Install Python

1. Download Python 3.11+ from [python.org](https://www.python.org/downloads/)
2. **Important**: Check "Add Python to PATH" during installation
3. Verify installation:
   ```cmd
   python --version
   ```

### Install PostgreSQL

1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and set password for `postgres` user
3. Verify installation:
   ```cmd
   psql --version
   ```

### Install Redis

Option A: Use Windows Subsystem for Linux (WSL)
```bash
wsl
sudo apt install redis-server
```

Option B: Use Docker Desktop (Recommended)
- Download from [docker.com](https://www.docker.com/products/docker-desktop)
- This includes Redis and PostgreSQL

### Install Git

Download from [git-scm.com](https://git-scm.com/download/win)

## Backend Setup Steps

### Step 1: Clone Repository

```cmd
git clone https://github.com/infidevelopers/agentic-ai-platform.git
cd agentic-ai-platform/backend
```

### Step 2: Create Virtual Environment

```cmd
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# You should see (venv) at the beginning of your command prompt
```

### Step 3: Install Dependencies

```cmd
# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

### Step 4: Configure Database

**Using PostgreSQL locally:**

```cmd
# Open pgAdmin or connect via psql
psql -U postgres

# In psql, create database:
CREATE DATABASE infiagentic;

# Create .env file
copy .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL=postgresql+asyncpg://postgres:your-password@localhost:5432/infiagentic
POSTGRES_PASSWORD=your-password
```

**Or use Docker for database:**
```cmd
# Start PostgreSQL in Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

# Update .env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/infiagentic
```

### Step 5: Set Environment Variables

Create `backend\.env`:
```cmd
copy .env.example .env
```

Edit the file with your values:
```env
ENVIRONMENT=development
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/infiagentic
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-your-key
```

### Step 6: Run Database Migrations

```cmd
# Make sure venv is activated
venv\Scripts\activate

# Create database tables
alembic upgrade head
```

### Step 7: Start the Server

```cmd
# Make sure venv is activated
venv\Scripts\activate

# Start FastAPI server
uvicorn app.main:app --reload
```

Server will be available at: http://localhost:8000
API Docs: http://localhost:8000/docs

## Running Celery Tasks (Optional)

Celery requires Redis. For Windows development, use Docker:

```cmd
# Terminal 1: Start Redis
docker run -p 6379:6379 redis:latest

# Terminal 2: Activate venv and start Celery worker
venv\Scripts\activate
celery -A app.celery_app worker --loglevel=info

# Terminal 3: Start Flower (monitoring)
celery -A app.celery_app flower

# Flower UI available at http://localhost:5555
```

## Running Tests

```cmd
# Make sure venv is activated
venv\Scripts\activate

# Run all tests
pytest -v

# Run specific test file
pytest tests/test_auth.py -v

# Run with coverage
pytest --cov=app tests/
```

## Common Issues and Solutions

### Issue: "python: command not found"
**Solution**: Python not in PATH. Reinstall Python and check "Add Python to PATH"

### Issue: "psycopg2-binary" fails to install
**Solution**: Install Visual C++ Build Tools or use pre-built wheel

### Issue: "Cannot connect to database"
**Solution**: 
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Make sure credentials are correct

### Issue: "Redis connection refused"
**Solution**:
- Start Redis using Docker: `docker run -p 6379:6379 redis:latest`
- Or install Redis for Windows

### Issue: Port 8000 already in use
**Solution**: 
```cmd
# Run on different port
uvicorn app.main:app --reload --port 8001
```

## Recommended Development Workflow

### Using Docker for Services (Recommended for Windows)

```cmd
# Terminal 1: Start database and cache
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
docker run --name redis -p 6379:6379 -d redis:latest

# Terminal 2: Activate venv and create tables
venv\Scripts\activate
alembic upgrade head

# Terminal 3: Start FastAPI
venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 4 (Optional): Start Celery worker
venv\Scripts\activate
celery -A app.celery_app worker --loglevel=info
```

### Using Docker Compose (Easiest)

```cmd
# Just run this in backend directory
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f
```

## VS Code Setup (Optional)

1. Install Python Extension by Microsoft
2. Select Python interpreter: `venv\Scripts\python.exe`
3. Create `.vscode/settings.json`:
   ```json
   {
     "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/Scripts/python.exe",
     "python.linting.enabled": true,
     "python.linting.pylintEnabled": true,
     "editor.formatOnSave": true,
     "python.formatting.provider": "black"
   }
   ```

## Next Steps

1. Complete setup steps above
2. Verify services running: http://localhost:8000/docs
3. Run tests: `pytest -v`
4. Set up frontend in another terminal
5. Start development!

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://www.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)
