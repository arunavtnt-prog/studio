#!/bin/bash
#
# Setup script for Jarvis Assistant
# Automates the complete setup process
#

set -e

echo "=================================="
echo "  Jarvis Assistant Setup Script"
echo "=================================="
echo ""

# Check if WhatsApp JSON exists
JSON_FILE="data/whatsapp_chat.json"

if [ ! -f "$JSON_FILE" ]; then
    echo "❌ WhatsApp JSON file not found at: $JSON_FILE"
    echo ""
    echo "Please place your WhatsApp chat export at:"
    echo "  jarvis_assistant/data/whatsapp_chat.json"
    echo ""
    echo "You can also specify a different file:"
    echo "  ./setup.sh path/to/your/file.json"
    exit 1
fi

# Allow custom JSON file path
if [ ! -z "$1" ]; then
    JSON_FILE="$1"
    echo "Using custom JSON file: $JSON_FILE"
fi

echo "Step 1/3: Installing Python dependencies..."
pip install -q -r requirements.txt
echo "✓ Dependencies installed"
echo ""

echo "Step 2/3: Processing WhatsApp chat and extracting facts..."
python preprocess.py "$JSON_FILE"
echo ""

echo "Step 3/3: Building vector index for semantic search..."
python memory_store.py build
echo ""

echo "=================================="
echo "✓ Setup Complete!"
echo "=================================="
echo ""
echo "Jarvis is ready to use. Run:"
echo "  python assistant.py"
echo ""
echo "Or try a quick test:"
echo "  python assistant.py 'Tell me about myself'"
echo ""
