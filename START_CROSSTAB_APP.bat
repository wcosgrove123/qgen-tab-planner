@echo off
echo.
echo ========================================
echo   SPSS Cross-Tabulation Dashboard
echo ========================================
echo.
echo Starting server on http://localhost:8080
echo.
echo Instructions:
echo 1. Upload your SPSS Codes.csv file
echo 2. Upload banner plan JSON (or use sample_banner_plan.json)
echo 3. Configure question types
echo 4. Generate cross-tabs!
echo.
echo Press Ctrl+C to stop the server
echo.

cd shiny_app
python main_with_crosstabs.py

pause