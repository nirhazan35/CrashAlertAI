#!/bin/bash
echo "🧪 Running CrashAlertAI Model Service Tests"
echo "=========================================="

# Activate virtual environment
source venv/bin/activate

# Set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Install dependencies if needed
pip install -r requirements.txt
pip install -r test_requirements.txt

# Run tests
pytest tests/ -v --tb=short