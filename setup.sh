#!/bin/bash

# CloudMart Project Setup Script
# This script initializes the entire CloudMart project

set -e

echo "🚀 CloudMart Project Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Skipping Docker setup."
else
    echo -e "${GREEN}✓ Docker $(docker -v)${NC}"
fi

# Setup Backend
echo -e "\n${YELLOW}Setting up Backend...${NC}"

cd backend

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo "  ⚠️  Please update .env with your AWS credentials"
else
    echo "ℹ️  .env file already exists"
fi

# Install dependencies
echo "Installing dependencies..."
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

cd ..

# Setup Frontend
echo -e "\n${YELLOW}Setting up Frontend...${NC}"

cd frontend

# Copy environment file
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local file${NC}"
    echo "  ⚠️  Please update .env.local with your Cognito and Stripe keys"
else
    echo "ℹ️  .env.local file already exists"
fi

# Install dependencies
echo "Installing dependencies..."
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ..

# Summary
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete! 🎉${NC}"
echo -e "${GREEN}================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Update backend/.env with AWS credentials"
echo "2. Update frontend/.env.local with Cognito/Stripe keys"
echo "3. Start development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker Compose:"
echo "   docker-compose up"
echo ""
echo "Documentation:"
echo "   - Setup Guide: SETUP.md"
echo "   - Development Guide: DEVELOPMENT.md"
echo "   - Project README: README.md"
