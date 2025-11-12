#!/bin/bash
# Update Vercel environment variable with backend URL

if [ -z "$1" ]; then
    echo "Usage: ./update-vercel.sh <BACKEND_API_URL>"
    echo "Example: ./update-vercel.sh https://yt-sprint-backend.up.railway.app/api"
    exit 1
fi

BACKEND_API_URL="$1"

echo "🔧 Updating Vercel environment variable..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backend API URL: $BACKEND_API_URL"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "🔐 Logging in to Vercel..."
vercel login

echo ""
echo "⚙️  Setting VITE_API_URL environment variable..."
vercel env add VITE_API_URL production <<EOF
$BACKEND_API_URL
EOF

vercel env add VITE_API_URL preview <<EOF
$BACKEND_API_URL
EOF

vercel env add VITE_API_URL development <<EOF
$BACKEND_API_URL
EOF

echo ""
echo "✅ Environment variable set successfully!"
echo ""
echo "🔄 Triggering Vercel redeploy..."
vercel --prod

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All done!"
echo ""
echo "🧪 Test your deployment:"
echo "   1. Open: https://yt-sprint.vercel.app"
echo "   2. Check browser console for API Base URL"
echo "   3. Try selecting a vertical - should load exams/subjects"
echo ""

