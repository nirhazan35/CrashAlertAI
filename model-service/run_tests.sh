#!/bin/bash

# Script to run tests for CrashAlertAI Model Service
# This script activates the virtual environment and runs pytest

echo "🧪 Running CrashAlertAI Model Service Tests"
echo "=========================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please create one first:"
    echo "   python -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    echo "   pip install -r test_requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Check if test dependencies are installed
echo "🔍 Checking test dependencies..."
pip show pytest > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🔧 Installing test dependencies..."
    pip install -r test_requirements.txt
fi

# Set environment variables for testing
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Run tests
echo "🚀 Running tests..."
pytest tests/ -v --tb=short

# Check test results
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed!"
    exit 1
fi

echo "🎉 Test run completed!" 