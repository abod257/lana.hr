@echo off
chcp 65001 >nul
title HRMS Portal - Starting...
color 0A
setlocal

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║           🏢 HRMS Portal - Starting Server              ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please run INSTALL.bat first.
    pause
    exit /b 1
)

REM Check dependencies
if not exist node_modules (
    echo ⚠️  Dependencies not installed. Running INSTALL.bat...
    call install.bat
    if %errorlevel% neq 0 exit /b 1
)

REM Check database
if not exist .env (
    echo ⚠️  .env file missing. Running INSTALL.bat...
    call install.bat
    if %errorlevel% neq 1 exit /b 1
)

REM Try to start PostgreSQL service
echo Starting PostgreSQL...
net start postgresql-x64-17 >nul 2>&1
net start postgresql-x64-16 >nul 2>&1
net start postgresql-x64-15 >nul 2>&1
net start postgresql-x64-14 >nul 2>&1

echo.
echo ✅ All systems ready!
echo.
echo ════════════════════════════════════════════════════════
echo.
echo   🌐 Opening browser in 5 seconds...
echo.
echo   URL: http://localhost:3000
echo.
echo   🔑 Login:
echo      Email:    admin@company.com
echo      Password: Admin@123456
echo.
echo ════════════════════════════════════════════════════════
echo.
echo   Press Ctrl+C to stop the server
echo.

REM Open browser after delay
start /min cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

REM Start the server
call npm run dev

pause
