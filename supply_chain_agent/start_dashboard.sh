#!/bin/bash
# Mobile Dashboard Quick Start Script
# This script starts the Flask API server and opens the dashboard in the browser

set -e

echo "================================"
echo "ChainPulse Mobile Dashboard"
echo "================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Install dependencies if needed
echo "📦 Checking dependencies..."
pip3 install flask flask-cors -q 2>/dev/null || true
echo "✅ Dependencies installed"
echo ""

# Start the API server
echo "🚀 Starting Mobile Dashboard API Server..."
echo ""

cd "$(dirname "$0")"

# Run Python API server
python3 dashboard_api.py &
API_PID=$!

# Wait for server to start
sleep 2

# Check if server is running
if ! kill -0 $API_PID 2>/dev/null; then
    echo "❌ Failed to start API server"
    exit 1
fi

echo ""
echo "✅ Server started successfully!"
echo ""
echo "================================"
echo "Dashboard is ready!"
echo "================================"
echo ""
echo "📱 Mobile: http://your-ip:5000"
echo "💻 Desktop: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Keep the script running
wait $API_PID
