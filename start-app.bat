@echo off
echo.
echo ========================================
echo   Starting Qgen Tab Planner
echo ========================================
echo.
echo Starting servers:
echo   [1] Web App: http://localhost:5173
echo   [2] Cross-Tab App: http://localhost:8888
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start API server in background
start /B "API Server" cmd /c "cd apps\web && node api-server.js"

REM Start Shiny cross-tab app in background
start /B "Shiny CrossTab" cmd /c "cd shiny_app && python main_with_crosstabs.py"

REM Wait for servers to start
timeout /t 5 /nobreak >nul

REM Start main web app (foreground)
npm run dev

pause