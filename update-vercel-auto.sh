#!/bin/bash
# Automatic Vercel Environment Variable Update

set -e

if [ -z "$1" ]; then
    read -p "Enter your backend API URL (with /api): " API_URL
else
    API_URL="$1"
fi

echo "════════════════════════════════════════════════════════════"
echo "🔧 Updating Vercel Environment Variable"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Backend API URL: $API_URL"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "→ Installing Vercel CLI..."
    npm i -g vercel
fi

# Login check
if ! vercel whoami &> /dev/null; then
    echo "→ Logging into Vercel..."
    vercel login
fi

echo "→ Setting VITE_API_URL for all environments..."

# Set for production
echo "$API_URL" | vercel env add VITE_API_URL production 2>/dev/null || \
    vercel env rm VITE_API_URL production -y && echo "$API_URL" | vercel env add VITE_API_URL production

# Set for preview
echo "$API_URL" | vercel env add VITE_API_URL preview 2>/dev/null || \
    vercel env rm VITE_API_URL preview -y && echo "$API_URL" | vercel env add VITE_API_URL preview

# Set for development
echo "$API_URL" | vercel env add VITE_API_URL development 2>/dev/null || \
    vercel env rm VITE_API_URL development -y && echo "$API_URL" | vercel env add VITE_API_URL development

echo ""
echo "→ Redeploying to production..."
cd "$(dirname "$0")"
vercel --prod --yes

echo ""
echo "✅ Done!"
echo ""
echo "Your app is live at: https://yt-sprint.vercel.app"
echo "Check console for API URL: $API_URL"

