#!/bin/bash

# JIFFY Backend Deployment Script
# Deploys backend to Railway

set -e

echo "🚀 JIFFY Backend Deployment"
echo "================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install it with: npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "⚠️  Not logged in to Railway. Running login..."
    railway login
fi

# Select environment
echo ""
echo "Select deployment environment:"
echo "1) Development"
echo "2) Production"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        ENV="development"
        ;;
    2)
        ENV="production"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📦 Deploying to $ENV..."

# Run tests
echo "🧪 Running tests..."
npm test || { echo "❌ Tests failed"; exit 1; }

echo "✅ Tests passed"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up --environment $ENV

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 Check status: railway status"
    echo "📊 View logs: railway logs"
else
    echo "❌ Deployment failed"
    exit 1
fi
