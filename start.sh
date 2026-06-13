#!/bin/bash

# =====================================================
# HRMS Portal - Quick Start Server
# =====================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║           🏢 HRMS Portal - Starting Server              ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js not found. Please run install.sh first.${NC}"
    exit 1
fi

# Check dependencies
if [ ! -d node_modules ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
fi

# Check .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file missing. Run install.sh first.${NC}"
    exit 1
fi

# Try to start PostgreSQL
echo -e "${BLUE}Starting PostgreSQL...${NC}"
if command -v brew >/dev/null 2>&1; then
    brew services start postgresql@16 2>/dev/null || true
elif command -v systemctl >/dev/null 2>&1; then
    sudo systemctl start postgresql 2>/dev/null || true
elif command -v service >/dev/null 2>&1; then
    sudo service postgresql start 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}✅ All systems ready!${NC}"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
echo "  🌐 Opening browser in 5 seconds..."
echo ""
echo "  URL: http://localhost:3000"
echo ""
echo "  🔑 Login:"
echo "     Email:    admin@company.com"
echo "     Password: Admin@123456"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
echo "  Press Ctrl+C to stop the server"
echo ""

# Detect OS and open browser
sleep 5
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000 2>/dev/null || true
fi &

# Start the server
npm run dev
