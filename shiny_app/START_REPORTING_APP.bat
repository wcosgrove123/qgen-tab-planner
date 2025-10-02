@echo off
echo ========================================
echo   SPSS Reporting Dashboard
echo   Professional Market Research Tool
echo ========================================
echo.
echo Starting Shiny for Python app...
echo.
echo Open your browser to: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
python -m shiny run app.py --host 0.0.0.0 --port 8000 --reload

pause
