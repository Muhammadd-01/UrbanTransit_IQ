#!/bin/bash
# UrbanTransit IQ — Resilient Dependency Installer
# Fixes timeout issues on slow or unstable internet connections

set -e

echo "=================================================="
echo "UrbanTransit IQ — Installing Python Dependencies"
echo "=================================================="

# Ensure venv is active or use venv binary directly
if [ -d "venv" ]; then
    PIP_CMD="./venv/bin/pip"
    PYTHON_CMD="./venv/bin/python"
else
    PIP_CMD="pip"
    PYTHON_CMD="python3"
fi

# 1. Upgrade pip with high timeout
echo ""
echo "[Step 1/3] Upgrading pip..."
$PYTHON_CMD -m pip install --upgrade pip --default-timeout=1000 || echo "Proceeding with current pip version..."

# 2. Install essential backend & web framework first
echo ""
echo "[Step 2/3] Installing core FastAPI & web packages..."
$PIP_CMD install --default-timeout=1000 --retries 10 \
    fastapi uvicorn pydantic pydantic-settings pyyaml python-dotenv \
    python-jose[cryptography] passlib[bcrypt] bcrypt supabase postgrest

# 3. Install Data Science, ML & Spark packages
echo ""
echo "[Step 3/3] Installing Data Science, Machine Learning & PySpark packages..."
$PIP_CMD install --default-timeout=1000 --retries 10 \
    pandas numpy scipy scikit-learn xgboost statsmodels pyarrow pyspark plotly httpx tqdm click

echo ""
echo "=================================================="
echo "✅ All Python dependencies installed successfully!"
echo "=================================================="
