#!/bin/bash
# Automatic Backend Deployment Script
# Tries Railway → Render → Heroku in order

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Automatic Backend Deployment - YT Sprint Dashboard      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Get AWS credentials
echo "📋 Enter your AWS credentials:"
read -p "AWS Access Key ID: " AWS_KEY
read -sp "AWS Secret Access Key: " AWS_SECRET
echo ""
read -p "AWS Region [ap-south-1]: " AWS_REGION
AWS_REGION=${AWS_REGION:-ap-south-1}
read -p "S3 Bucket Name: " S3_BUCKET

echo ""
echo "════════════════════════════════════════════════════════════"

# Try Railway
if command -v railway &> /dev/null; then
    echo "✓ Railway CLI found. Attempting Railway deployment..."
    echo ""
    
    cd "$(dirname "$0")/backend"
    
    # Check if logged in
    if railway whoami &> /dev/null; then
        echo "✓ Already logged into Railway"
    else
        echo "→ Logging into Railway..."
        railway login
    fi
    
    # Initialize project
    echo "→ Creating Railway project..."
    railway init --name yt-sprint-backend || railway link
    
    # Deploy
    echo "→ Deploying to Railway..."
    railway up
    
    # Set variables
    echo "→ Setting environment variables..."
    railway variables set AWS_ACCESS_KEY_ID="$AWS_KEY"
    railway variables set AWS_SECRET_ACCESS_KEY="$AWS_SECRET"
    railway variables set AWS_REGION="$AWS_REGION"
    railway variables set S3_BUCKET_NAME="$S3_BUCKET"
    
    # Get URL
    echo "→ Generating domain..."
    BACKEND_URL=$(railway domain)
    
    echo ""
    echo "✅ Backend deployed successfully on Railway!"
    echo "📍 URL: $BACKEND_URL"
    echo ""
    echo "Next step: Update Vercel"
    echo "VITE_API_URL=$BACKEND_URL/api"
    exit 0
fi

# Try Heroku
if command -v heroku &> /dev/null; then
    echo "✓ Heroku CLI found. Attempting Heroku deployment..."
    echo ""
    
    cd "$(dirname "$0")"
    
    # Login check
    if heroku whoami &> /dev/null; then
        echo "✓ Already logged into Heroku"
    else
        echo "→ Logging into Heroku..."
        heroku login
    fi
    
    # Create app
    APP_NAME="yt-sprint-backend-$(date +%s)"
    echo "→ Creating Heroku app: $APP_NAME"
    heroku create "$APP_NAME"
    
    # Set variables
    echo "→ Setting environment variables..."
    heroku config:set AWS_ACCESS_KEY_ID="$AWS_KEY" -a "$APP_NAME"
    heroku config:set AWS_SECRET_ACCESS_KEY="$AWS_SECRET" -a "$APP_NAME"
    heroku config:set AWS_REGION="$AWS_REGION" -a "$APP_NAME"
    heroku config:set S3_BUCKET_NAME="$S3_BUCKET" -a "$APP_NAME"
    
    # Deploy
    echo "→ Deploying to Heroku..."
    git subtree push --prefix backend heroku main
    
    # Get URL
    BACKEND_URL=$(heroku info -s -a "$APP_NAME" | grep web_url | cut -d= -f2)
    
    echo ""
    echo "✅ Backend deployed successfully on Heroku!"
    echo "📍 URL: $BACKEND_URL"
    echo ""
    echo "Next step: Update Vercel"
    echo "VITE_API_URL=$BACKEND_URL/api"
    exit 0
fi

# No CLI found - show manual instructions
echo "❌ No deployment CLI found (Railway or Heroku)"
echo ""
echo "Install one of these:"
echo ""
echo "Railway:"
echo "  npm i -g @railway/cli"
echo "  Then run: ./deploy-auto.sh"
echo ""
echo "Heroku:"
echo "  brew install heroku/brew/heroku"
echo "  Then run: ./deploy-auto.sh"
echo ""
echo "Or use Render (web-based, no CLI needed):"
echo "  https://dashboard.render.com/select-repo?type=web"
exit 1

