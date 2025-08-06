#!/bin/bash

# Face Detection Project Startup Script (Conda Version)

echo "🚀 Starting Face Detection Project..."

ENV_NAME="ml"

# Check if the conda environment exists
if ! conda info --envs | grep -q "$ENV_NAME"; then
    echo "📦 Creating Conda environment '$ENV_NAME'..."
    conda create -y -n $ENV_NAME python=3.10
fi

# Activate conda environment
echo "🔧 Activating Conda environment '$ENV_NAME'..."
# Detect if the script is run from interactive shell
if [[ $- == *i* ]]; then
    conda activate $ENV_NAME
else
    source "$(conda info --base)/etc/profile.d/conda.sh"
    conda activate $ENV_NAME
fi

# Install dependencies
echo "📥 Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Start FastAPI server
echo "🌐 Starting FastAPI server on http://localhost:8000"
echo "📱 Open your browser and navigate to: http://localhost:8000"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
