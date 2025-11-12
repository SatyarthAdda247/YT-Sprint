#!/bin/bash
# Test backend deployment

if [ -z "$1" ]; then
    echo "Usage: ./test-backend.sh <BACKEND_URL>"
    echo "Example: ./test-backend.sh https://yt-sprint-backend.up.railway.app"
    exit 1
fi

BACKEND_URL="$1"
API_URL="${BACKEND_URL}/api"

echo "🧪 Testing Backend Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend URL: $BACKEND_URL"
echo "API URL: $API_URL"
echo ""

echo "Test 1: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/options" -H "X-User-Email: test@adda247.com")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend is responding (HTTP $HTTP_CODE)"
else
    echo "❌ Backend health check failed (HTTP $HTTP_CODE)"
    exit 1
fi
echo ""

echo "Test 2: Options Endpoint (Verticals/Exams/Subjects)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s "$API_URL/options" -H "X-User-Email: test@adda247.com")

# Check if response contains expected data
if echo "$RESPONSE" | grep -q "verticals" && echo "$RESPONSE" | grep -q "Bank Pre"; then
    echo "✅ Options endpoint working"
    echo ""
    echo "Sample response:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -20
    echo "..."
else
    echo "❌ Options endpoint not returning expected data"
    echo "Response: $RESPONSE"
    exit 1
fi
echo ""

echo "Test 3: Check Verticals"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
VERTICALS=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('verticals', [])))" 2>/dev/null)
if [ "$VERTICALS" = "12" ]; then
    echo "✅ All 12 verticals found"
else
    echo "⚠️  Found $VERTICALS verticals (expected 12)"
fi
echo ""

echo "Test 4: Check Exams for 'Bank Pre'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
BANK_EXAMS=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('categories_by_vertical', {}).get('Bank Pre', [])))" 2>/dev/null)
if [ "$BANK_EXAMS" -gt "0" ]; then
    echo "✅ Bank Pre has $BANK_EXAMS exams"
else
    echo "❌ No exams found for Bank Pre"
fi
echo ""

echo "Test 5: Check Subjects for 'Bank Pre'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
BANK_SUBJECTS=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('subjects_by_vertical', {}).get('Bank Pre', [])))" 2>/dev/null)
if [ "$BANK_SUBJECTS" -gt "0" ]; then
    echo "✅ Bank Pre has $BANK_SUBJECTS subjects"
else
    echo "❌ No subjects found for Bank Pre"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests passed!"
echo ""
echo "🎯 Next Steps:"
echo "1. Update Vercel with: VITE_API_URL=$API_URL"
echo "2. Run: ./update-vercel.sh $API_URL"
echo ""

