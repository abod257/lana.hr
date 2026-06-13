#!/bin/bash

# =====================================================
# HRMS Portal - One-Click Installer for macOS/Linux
# =====================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║          🏢 HRMS Portal - One-Click Installer           ║"
echo "║                                                          ║"
echo "║     Installing everything automatically for you...      ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check Node.js
echo -e "${BLUE}[1/6]${NC} Checking Node.js..."
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is NOT installed!${NC}"
    echo ""
    echo "Please install Node.js from: https://nodejs.org"
    echo "After installation, run this script again."
    echo ""
    if command -v brew >/dev/null 2>&1; then
        echo "Or install via Homebrew:"
        echo "  brew install node"
    elif command -v apt >/dev/null 2>&1; then
        echo "Or install via apt:"
        echo "  sudo apt install nodejs npm"
    fi
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION found${NC}"

# Step 2: Check/Install PostgreSQL
echo ""
echo -e "${BLUE}[2/6]${NC} Checking PostgreSQL..."
if ! command -v psql >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  PostgreSQL not detected. Installing...${NC}"
    if command -v brew >/dev/null 2>&1; then
        brew install postgresql@16
        brew services start postgresql@16
    elif command -v apt >/dev/null 2>&1; then
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        echo -e "${RED}❌ Please install PostgreSQL manually${NC}"
        echo "Visit: https://www.postgresql.org/download/"
        exit 1
    fi
fi
echo -e "${GREEN}✅ PostgreSQL found${NC}"

# Step 3: Install dependencies
echo ""
echo -e "${BLUE}[3/6]${NC} Installing application dependencies..."
echo "This may take 2-3 minutes..."
npm install --no-audit --no-fund
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 4: Setup database
echo ""
echo -e "${BLUE}[4/6]${NC} Setting up database..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
fi

# Create database
echo Creating database...
sudo -u postgres psql -c "CREATE USER hrms_user WITH PASSWORD 'hrms_password';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE hrms_portal OWNER hrms_user;" 2>/dev/null || true
echo -e "${GREEN}✅ Database ready${NC}"

# Step 5: Run migrations
echo ""
echo -e "${BLUE}[5/6]${NC} Running database migrations..."
npx prisma generate >/dev/null 2>&1
npx prisma db push --accept-data-loss --skip-generate 2>&1 | tail -3
echo -e "${GREEN}✅ Migrations complete${NC}"

# Step 6: Seed database
echo ""
echo -e "${BLUE}[6/6]${NC} Seeding database with sample data..."
npm run db:seed 2>&1 | tail -3
echo -e "${GREEN}✅ Database seeded${NC}"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║          ✅ Installation Complete! 🎉                    ║"
echo "║                                                          ║"
echo "║  The application is ready to use.                       ║"
echo "║                                                          ║"
echo "║  Next step: Run ./start.sh                             ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "🔑 Login Credentials:"
echo "   Admin:    admin@company.com    / Admin@123456"
echo "   Employee: ahmed.mohammed@company.com / Demo@123456"
echo ""
echo "Press any key to start the server now, or Ctrl+C to exit..."
read -n 1 -s

bash ./start.sh
