#!/bin/bash

# JIFFY Backend Deployment Script for Railway

set -e

echo "🚀 Deploying JIFFY Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi

# Build TypeScript
echo "📦 Building TypeScript..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

# Deploy to Railway
echo "🚂 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "📊 Monitor logs: railway logs"
echo "🔗 Check status: railway status"