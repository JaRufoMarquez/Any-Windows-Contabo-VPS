#!/bin/bash

# Windows Installer for Contabo VPS - Quick Start Script

set -e

echo "==================================="
echo "Windows Installer for Contabo VPS"
echo "==================================="
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✓ Docker and Docker Compose found"
    echo ""
    echo "Starting application with Docker..."
    docker-compose up -d
    echo ""
    echo "✓ Application started!"
    echo ""
    echo "Open your browser and navigate to:"
    echo "  http://localhost"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
else
    echo "⚠ Docker or Docker Compose not found"
    echo ""
    echo "Please install Docker and Docker Compose, or run manually:"
    echo ""
    echo "Backend:"
    echo "  cd backend"
    echo "  python -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    echo "  python main.py"
    echo ""
    echo "Frontend (in new terminal):"
    echo "  cd frontend"
    echo "  npm install"
    echo "  npm run dev"
    echo ""
    echo "Then open http://localhost:3000"
fi
