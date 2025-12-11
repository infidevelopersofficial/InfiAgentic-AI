#!/bin/bash

# InfiAgentic Platform - Development Setup Script
# This script sets up the entire project for local development

set -e  # Exit on error

echo "=========================================="
echo "InfiAgentic Platform - Development Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠ pnpm is not installed${NC}"
    echo "Installing pnpm..."
    npm install -g pnpm
fi
PNPM_VERSION=$(pnpm -v)
echo -e "${GREEN}✓ pnpm installed: $PNPM_VERSION${NC}"

# Check Python (optional for backend)
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python installed: $PYTHON_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Python is not installed (needed for backend)${NC}"
fi

echo ""
echo "=========================================="
echo "Setting up Frontend"
echo "=========================================="
echo ""

# Install frontend dependencies
echo "Installing frontend dependencies..."
pnpm install

# Create environment file
if [ ! -f .env.local ]; then
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo -e "${YELLOW}⚠ Please update .env.local with your API keys${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

echo -e "${GREEN}✓ Frontend setup complete!${NC}"

echo ""
echo "=========================================="
echo "Optional: Backend Setup"
echo "=========================================="
echo ""

# Ask if user wants to set up backend
read -p "Do you want to set up the FastAPI backend? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    
    # Create virtual environment
    if [ ! -d venv ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
        echo -e "${GREEN}✓ Virtual environment created${NC}"
    else
        echo -e "${GREEN}✓ Virtual environment already exists${NC}"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install Python dependencies
    echo "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
    
    # Create environment file
    if [ ! -f .env ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${YELLOW}⚠ Please update backend/.env with your configuration${NC}"
    else
        echo -e "${GREEN}✓ .env already exists${NC}"
    fi
    
    cd ..
    echo -e "${GREEN}✓ Backend setup complete!${NC}"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "2. Update backend/.env with your configuration"
    echo "3. Run 'pnpm dev' to start the frontend"
    echo "4. In another terminal, run 'cd backend && source venv/bin/activate && uvicorn app.main:app --reload' to start the backend"
else
    echo "2. Run 'pnpm dev' to start the frontend"
fi
echo ""
echo "Frontend will be available at: http://localhost:3000"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Backend will be available at: http://localhost:8000"
    echo "API Docs will be available at: http://localhost:8000/docs"
fi
