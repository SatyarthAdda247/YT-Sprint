#!/bin/bash
# ONE COMMAND DEPLOYMENT - Does everything

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          YT SPRINT - ONE COMMAND DEPLOYMENT               ║"
echo "║      Backend + Vercel Setup - Fully Automated             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if running from correct directory
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo "❌ Please run from project root directory"
    exit 1
fi

cd "$(dirname "$0")"

# Step 1: Deploy Backend
echo "STEP 1: Deploying Backend"
echo "════════════════════════════════════════════════════════════"
./deploy-auto.sh

# Capture backend URL from output
BACKEND_URL=$(grep "📍 URL:" | tail -1 | awk '{print $3}')

if [ -z "$BACKEND_URL" ]; then
    echo ""
    read -p "Enter your backend URL from above: " BACKEND_URL
fi

# Step 2: Update Vercel
echo ""
echo "STEP 2: Updating Vercel"
echo "════════════════════════════════════════════════════════════"
./update-vercel-auto.sh "$BACKEND_URL/api"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    🎉 ALL DONE! 🎉                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Backend deployed: $BACKEND_URL"
echo "✅ Vercel configured: https://yt-sprint.vercel.app"
echo "✅ Ready to use!"
echo ""
echo "Test your app:"
echo "  curl $BACKEND_URL/api/options -H 'X-User-Email: test@adda247.com'"
echo ""

