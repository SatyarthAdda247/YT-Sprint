#!/bin/bash
# Backend Deployment Script for Railway
# This script deploys the backend to Railway

set -e  # Exit on error

echo "🚀 YT Sprint Backend Deployment"
echo "================================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm i -g @railway/cli
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend"

echo "📁 Current directory: $(pwd)"
echo ""

# Step 1: Login to Railway
echo "🔐 Step 1: Login to Railway"
echo "   This will open a browser window for authentication..."
railway login

# Step 2: Initialize Railway project
echo ""
echo "🎯 Step 2: Initialize Railway project"
railway init

# Step 3: Deploy
echo ""
echo "🚢 Step 3: Deploying backend..."
railway up

# Step 4: Set environment variables
echo ""
echo "⚙️  Step 4: Setting environment variables"
echo ""
echo "⚠️  You need to provide AWS credentials:"
echo ""

# Ask for AWS credentials
read -p "Enter AWS_ACCESS_KEY_ID: " AWS_KEY
read -s -p "Enter AWS_SECRET_ACCESS_KEY: " AWS_SECRET
echo ""
read -p "Enter AWS_REGION [ap-south-1]: " AWS_REGION
AWS_REGION=${AWS_REGION:-ap-south-1}
read -p "Enter S3_BUCKET_NAME: " S3_BUCKET

echo ""
echo "Setting Railway environment variables..."
railway variables set AWS_ACCESS_KEY_ID="$AWS_KEY"
railway variables set AWS_SECRET_ACCESS_KEY="$AWS_SECRET"
railway variables set AWS_REGION="$AWS_REGION"
railway variables set S3_BUCKET_NAME="$S3_BUCKET"

# Step 5: Get the deployment URL
echo ""
echo "🌐 Step 5: Getting deployment URL..."
BACKEND_URL=$(railway domain)

echo ""
echo "✅ Backend deployed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Backend URL: $BACKEND_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Next Steps:"
echo "1. Test backend: curl ${BACKEND_URL}/api/options -H 'X-User-Email: test@adda247.com'"
echo "2. Update Vercel environment variable:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Select 'yt-sprint' project"
echo "   - Settings → Environment Variables"
echo "   - Add: VITE_API_URL = ${BACKEND_URL}/api"
echo "3. Redeploy Vercel frontend"
echo ""
echo "Or run: ./update-vercel.sh ${BACKEND_URL}/api"
echo ""

