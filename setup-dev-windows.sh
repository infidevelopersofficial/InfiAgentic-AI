#!/bin/bash

# InfiAgentic Platform - Windows Development Setup Script
# This script sets up the entire project for local development on Windows (using Git Bash or similar)

set -e

echo "=========================================="
echo "InfiAgentic Platform - Development Setup (Windows)"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

echo "For Windows backend setup, please use the SETUP-BACKEND-WINDOWS.md guide"
echo "Or use Docker Desktop instead"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys"
echo "2. Run 'pnpm dev' to start the frontend"
echo ""
echo "Frontend will be available at: http://localhost:3000"
