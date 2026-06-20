@echo off
REM ChainPulse - Start All Services (New Structure)
REM This batch script automatically starts frontend and backend

echo.
echo ================================================================================
echo.
echo   ChainPulse - Organized Structure
echo   Starting Frontend and Backend Services
echo.
echo ================================================================================
echo.

REM Get the current directory (supply_chain_agent folder)
set "ROOT_DIR=%CD%"

REM Check if required directories exist
if not exist "backend\" (
    echo Error: backend\ folder not found
    echo.
    echo Please run this from: c:\Users\dell\OneDrive\Desktop\my_project_hackathon\supply_chain_agent
    echo.
    echo Expected structure:
    echo   supply_chain_agent\
    echo   ├── backend\
    echo   └── frontend\
    pause
    exit /b 1
)

if not exist "frontend\" (
    echo Error: frontend\ folder not found
    echo.
    echo Please run this from: c:\Users\dell\OneDrive\Desktop\my_project_hackathon\supply_chain_agent
    echo.
    echo Expected structure:
    echo   supply_chain_agent\
    echo   ├── backend\
    echo   └── frontend\
    pause
    exit /b 1
)

echo [1/3] Verified folder structure ✓
echo.
echo [2/3] Starting Backend (port 5000)...
start "ChainPulse Backend" powershell -NoExit -Command "cd '%ROOT_DIR%\backend'; python run.py"

REM Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak

echo.
echo [3/3] Starting Frontend (port 8000)...
start "ChainPulse Frontend" powershell -NoExit -Command "cd '%ROOT_DIR%\frontend'; python run.py"

echo.
echo ================================================================================
echo.
echo   ✅ Both services are starting!
echo.
echo   🌐 Frontend: http://localhost:8000
echo   🔧 Backend:  http://localhost:5000
echo.
echo   📂 Folders:
echo      • Backend:  %ROOT_DIR%\backend
echo      • Frontend: %ROOT_DIR%\frontend
echo.
echo   Press Ctrl+C in each terminal to stop
echo.
echo ================================================================================
echo.

pause
