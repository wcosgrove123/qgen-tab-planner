#!/bin/bash
# Quick Start Script for AI Agent

echo "🚀 QGEN AI Agent - Quick Start"
echo "================================"

# Check if Ollama is installed
echo -e "\n📦 Checking Ollama installation..."
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is installed"
else
    echo "❌ Ollama not found. Install from: https://ollama.com/download"
    exit 1
fi

# Check if Ollama is running
echo -e "\n🔍 Checking if Ollama is running..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "⚠️  Ollama not running. Starting Ollama..."
    ollama serve &
    sleep 3
fi

# Pull required models
echo -e "\n📥 Checking required models..."

echo "Checking chat model (llama3.1:8b)..."
if ollama list | grep -q "llama3.1:8b"; then
    echo "✅ Chat model already installed"
else
    echo "📥 Pulling llama3.1:8b (4.7GB)..."
    ollama pull llama3.1:8b
fi

echo "Checking embedding model (bge-large-en-v1.5)..."
if ollama list | grep -q "bge-large-en-v1.5"; then
    echo "✅ Embedding model already installed"
else
    echo "📥 Pulling bge-large-en-v1.5 (335MB)..."
    ollama pull bge-large-en-v1.5
fi

# Install Python dependencies
echo -e "\n📦 Installing Python dependencies..."
if command -v poetry &> /dev/null; then
    poetry install
else
    echo "⚠️  Poetry not found. Installing..."
    pip install poetry
    poetry install
fi

# Setup environment
echo -e "\n⚙️  Setting up environment..."
if [ ! -f .env ]; then
    echo "Creating .env from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your Supabase credentials"
else
    echo "✅ .env already exists"
fi

# Run tests
echo -e "\n🧪 Running setup tests..."
poetry run python scripts/test_setup.py

echo -e "\n✅ Setup complete!"
echo -e "\n🚀 To start the AI agent:"
echo "   poetry run python -m app.main"
echo -e "\n📚 Then visit: http://localhost:8001/docs"
