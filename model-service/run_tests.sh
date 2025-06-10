#!/bin/bash
echo "🧪 Running CrashAlertAI Model Service Tests"
echo "=========================================="

# Set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Install dependencies if needed
pip install -r test_requirements.txt

# Run tests
pytest tests/ -v --tb=short