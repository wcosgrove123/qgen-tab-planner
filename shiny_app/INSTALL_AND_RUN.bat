@echo off
echo ========================================
echo   SPSS Reporting Dashboard Setup
echo ========================================
echo.

echo Step 1: Installing Python dependencies...
echo.
pip install -r requirements.txt

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Starting the Shiny app...
echo.
echo Open your browser to: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python -m shiny run app.py --host 0.0.0.0 --port 8000 --reload

pause
