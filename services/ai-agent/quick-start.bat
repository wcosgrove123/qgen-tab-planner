@echo off
REM Quick Start Script for AI Agent (Windows)

echo ========================================
echo  QGEN AI Agent - Quick Start (Windows)
echo ========================================

REM Check if Ollama is installed
echo.
echo Checking Ollama installation...
where ollama >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Ollama not found
    echo     Download from: https://ollama.com/download
    exit /b 1
) else (
    echo [OK] Ollama is installed
)

REM Check if Ollama is running
echo.
echo Checking if Ollama is running...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Ollama not running. Starting Ollama...
    start "" ollama serve
    timeout /t 3 >nul
) else (
    echo [OK] Ollama is running
)

REM Pull required models
echo.
echo Checking required models...

echo Checking chat model (llama3.1:8b)...
ollama list | findstr "llama3.1:8b" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Pulling llama3.1:8b (4.7GB)...
    ollama pull llama3.1:8b
) else (
    echo [OK] Chat model already installed
)

echo Checking embedding model (bge-large-en-v1.5)...
ollama list | findstr "bge-large-en-v1.5" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Pulling bge-large-en-v1.5 (335MB)...
    ollama pull bge-large-en-v1.5
) else (
    echo [OK] Embedding model already installed
)

REM Install Python dependencies
echo.
echo Installing Python dependencies...
where poetry >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installing Poetry...
    pip install poetry
)
poetry install

REM Setup environment
echo.
echo Setting up environment...
if not exist .env (
    echo Creating .env from template...
    copy .env.example .env
    echo [!] Please edit .env with your Supabase credentials
) else (
    echo [OK] .env already exists
)

REM Run tests
echo.
echo Running setup tests...
poetry run python scripts\test_setup.py

echo.
echo ========================================
echo  Setup complete!
echo ========================================
echo.
echo To start the AI agent:
echo   poetry run python -m app.main
echo.
echo Then visit: http://localhost:8001/docs
echo.

pause
