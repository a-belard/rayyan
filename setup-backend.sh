#!/bin/bash
# Quick setup script for Rayyan backend

set -e

echo "🚀 Setting up Rayyan Backend..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo "✅ uv installed successfully"
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd backend
uv pip install -e .

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your Supabase credentials"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your Supabase credentials"
echo "2. Run: cd backend && python main.py"
echo "3. Visit: http://localhost:8000/docs"
