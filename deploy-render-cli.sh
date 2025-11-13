#!/bin/bash
# Render Deployment via CLI (Blueprint)

set -e

echo "════════════════════════════════════════════════════════════"
echo "🚀 Deploying to Render"
echo "════════════════════════════════════════════════════════════"
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
echo "→ Creating render.yaml with your credentials..."

# Create temporary render.yaml with actual credentials
cd "$(dirname "$0")"
cat > render-deploy.yaml << EOF
services:
  - type: web
    name: yt-sprint-backend
    env: python
    region: singapore
    plan: free
    branch: main
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app --bind 0.0.0.0:\$PORT
    envVars:
      - key: AWS_ACCESS_KEY_ID
        value: $AWS_KEY
      - key: AWS_SECRET_ACCESS_KEY
        value: $AWS_SECRET
      - key: AWS_REGION
        value: $AWS_REGION
      - key: S3_BUCKET_NAME
        value: $S3_BUCKET
EOF

echo ""
echo "✅ Configuration created!"
echo ""
echo "Now deploy via Render Dashboard:"
echo ""
echo "1. Go to: https://dashboard.render.com/select-repo?type=web"
echo "2. Connect GitHub: SatyarthAdda247/YT-Sprint"
echo "3. Render will auto-detect render.yaml"
echo "4. Click 'Apply' and 'Create Web Service'"
echo "5. Copy the URL once deployed"
echo ""
echo "Or push render-deploy.yaml to GitHub and Render will detect it automatically"
echo ""

# Clean up
rm render-deploy.yaml

