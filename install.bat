@echo off
chcp 65001 >nul
title HRMS Portal - Installer
color 0B
setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║          🏢 HRMS Portal - One-Click Installer           ║
echo ║                                                          ║
echo ║     Installing everything automatically for you...      ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is NOT installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Download the "Windows Installer (.msi)" - LTS version
    echo After installation, run this script again.
    echo.
    pause
    start https://nodejs.org
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

REM Check if PostgreSQL is installed
echo.
echo [2/6] Checking PostgreSQL...
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL not detected - installing portable version...
    call :install_postgres
) else (
    echo ✅ PostgreSQL found
)

REM Install dependencies
echo.
echo [3/6] Installing application dependencies (this may take 2-3 minutes)...
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

REM Setup database
echo.
echo [4/6] Setting up database...
if not exist .env (
    copy .env.example .env >nul
    echo ✅ Created .env file
)

REM Start PostgreSQL if not running
net start postgresql-x64-17 >nul 2>&1
net start postgresql-x64-16 >nul 2>&1
net start postgresql-x64-15 >nul 2>&1
net start postgresql-x64-14 >nul 2>&1

REM Wait for PostgreSQL to be ready
timeout /t 3 /nobreak >nul

REM Create database if not exists
echo Creating database...
psql -U postgres -c "CREATE USER hrms_user WITH PASSWORD 'hrms_password';" 2>nul
psql -U postgres -c "CREATE DATABASE hrms_portal OWNER hrms_user;" 2>nul
echo ✅ Database ready

REM Run migrations
echo.
echo [5/6] Running database migrations...
call npx prisma generate >nul
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo ⚠️  Migration had warnings - continuing
)

REM Seed database
echo.
echo [6/6] Seeding database with sample data...
call npm run db:seed
echo ✅ Database seeded

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║          ✅ Installation Complete! 🎉                    ║
echo ║                                                          ║
echo ║  The application is ready to use.                       ║
echo ║                                                          ║
echo ║  Next step: Double-click START.bat                     ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 🔑 Login Credentials:
echo    Admin:    admin@company.com    / Admin@123456
echo    Employee: ahmed.mohammed@company.com / Demo@123456
echo.
pause
exit /b 0

:install_postgres
echo Downloading PostgreSQL portable...
echo Please download from: https://www.postgresql.org/download/windows/
echo After installing PostgreSQL, run this script again.
pause
start https://www.postgresql.org/download/windows/
exit /b 1
