@echo off
echo.
echo ========================================
echo   Starting QGEN + Reporting Dashboard
echo ========================================
echo.
echo Starting two servers:
echo   - Web App (Questionnaire Builder): http://localhost:5173
echo   - Reporting Dashboard (Shiny):      http://localhost:8000
echo.
echo Both apps will open automatically...
echo.

REM Start Shiny reporting app in new window
start "Shiny Reporting Dashboard" cmd /c "cd shiny_app && python -m shiny run app.py --host 0.0.0.0 --port 8000 --reload"

REM Wait 3 seconds for Shiny to start
echo Waiting for Shiny app to start...
timeout /t 3 /nobreak >nul

REM Start web app (this will stay in foreground)
echo Starting web app...
cd apps\web
npm run dev

pause