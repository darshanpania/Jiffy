#!/bin/bash

# Setup Environment Variables Script
# Helps configure .env file

echo "🔧 JIFFY Backend Environment Setup"
echo "==================================="
echo ""

if [ -f .env ]; then
    read -p ".env file already exists. Overwrite? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "Aborted."
        exit 0
    fi
fi

cp .env.example .env

echo "Please provide the following configuration:"
echo ""

# Supabase
read -p "Supabase URL: " SUPABASE_URL
read -p "Supabase Service Key: " SUPABASE_SERVICE_KEY
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY

# Firebase
read -p "Firebase Project ID: " FCM_PROJECT_ID
read -p "Firebase Client Email: " FCM_CLIENT_EMAIL
echo "Firebase Private Key (paste entire key including BEGIN/END lines):"
read -p "" FCM_PRIVATE_KEY

# APIs
read -p "GIPHY API Key: " GIPHY_API_KEY
read -p "Tenor API Key: " TENOR_API_KEY

# Update .env file
sed -i '' "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" .env
sed -i '' "s|SUPABASE_SERVICE_KEY=.*|SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY|" .env
sed -i '' "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env
sed -i '' "s|FCM_PROJECT_ID=.*|FCM_PROJECT_ID=$FCM_PROJECT_ID|" .env
sed -i '' "s|FCM_CLIENT_EMAIL=.*|FCM_CLIENT_EMAIL=$FCM_CLIENT_EMAIL|" .env
sed -i '' "s|GIPHY_API_KEY=.*|GIPHY_API_KEY=$GIPHY_API_KEY|" .env
sed -i '' "s|TENOR_API_KEY=.*|TENOR_API_KEY=$TENOR_API_KEY|" .env

echo ""
echo "✅ Environment setup complete!"
echo "Configuration saved to .env"
echo ""
echo "Next steps:"
echo "1. Review .env file and add FCM private key properly"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
