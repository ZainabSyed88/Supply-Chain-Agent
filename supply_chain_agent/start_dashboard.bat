@echo off
REM Mobile Dashboard Quick Start Script (Windows)
REM This script starts the Flask API server and opens the dashboard in the browser

setlocal enabledelayedexpansion

echo ================================
echo ChainPulse Mobile Dashboard
echo ================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is required but not installed.
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [OK] Python found: %PYTHON_VERSION%
echo.

REM Install dependencies if needed
echo Installing dependencies...
pip install flask flask-cors -q
echo [OK] Dependencies installed
echo.

REM Change to script directory
cd /d "%~dp0"

REM Start the API server
echo Starting Mobile Dashboard API Server...
echo.

start "ChainPulse Dashboard API" python dashboard_api.py

REM Wait for server to start
timeout /t 3 /nobreak >nul

REM Open browser
echo.
echo ================================
echo Dashboard is ready!
echo ================================
echo.
echo Mobile: http://your-ip:5000
echo Desktop: http://localhost:5000
echo.
echo Opening browser...
echo.

start http://localhost:5000

echo Press Ctrl+C in the API window to stop the server

REM Keep window open
pause
