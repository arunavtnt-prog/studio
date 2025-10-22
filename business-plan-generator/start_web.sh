#!/bin/bash
# Simple startup script for Business Plan Generator Web UI

echo "======================================"
echo "Business Plan Generator - Web UI"
echo "======================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with your API keys."
    echo "Example:"
    echo "  ANTHROPIC_API_KEY=your-key-here"
    echo ""
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

# Start the Flask application
echo ""
echo "Starting web server..."
echo ""
python app.py
