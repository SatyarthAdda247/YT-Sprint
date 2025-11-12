# Deployment Guide

This guide covers deploying the Content Dashboard to production.

## Architecture

- **Frontend**: React app → Netlify
- **Backend**: Flask API → Heroku/Railway
- **Storage**: AWS S3

## Option 1: Deploy Backend to Heroku (Recommended)

### Prerequisites
```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login
```

### Deploy Backend

```bash
cd backend

# Create Heroku app
heroku create your-content-dashboard-api

# Set environment variables
heroku config:set AWS_ACCESS_KEY_ID=your_aws_access_key_here
heroku config:set AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
heroku config:set AWS_REGION=ap-south-1
heroku config:set S3_BUCKET_NAME=your-bucket-name

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-content-dashboard-api
git push heroku main

# Check logs
heroku logs --tail
```

Your backend will be available at: `https://your-content-dashboard-api.herokuapp.com`

## Option 2: Deploy Backend to Railway

### Prerequisites
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login
```

### Deploy Backend

```bash
cd backend

# Initialize Railway project
railway init

# Set environment variables
railway variables set AWS_ACCESS_KEY_ID=your_aws_access_key_here
railway variables set AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
railway variables set AWS_REGION=ap-south-1
railway variables set S3_BUCKET_NAME=your-bucket-name

# Deploy
railway up

# Get URL
railway domain
```

## Deploy Frontend to Netlify

### Prerequisites
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login
```

### Update Frontend Configuration

1. Edit `frontend/.env.production` and set your backend URL:
```env
VITE_API_URL=https://your-content-dashboard-api.herokuapp.com/api
```

### Deploy to Netlify

```bash
cd frontend

# Build the app
npm install
npm run build

# Deploy to Netlify
netlify deploy --prod

# Follow the prompts:
# - Create & configure a new site
# - Choose a site name
# - Publish directory: dist
```

**OR use the provided script:**

```bash
cd /Users/adda247/Downloads/ytsprint
chmod +x deploy-netlify.sh
./deploy-netlify.sh
```

Your frontend will be available at: `https://your-site-name.netlify.app`

## Quick Deployment Script

### Deploy Backend (Heroku)
```bash
#!/bin/bash
cd backend
heroku create content-dashboard-$(date +%s)
heroku config:set AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
heroku config:set AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
heroku config:set AWS_REGION=ap-south-1
heroku config:set S3_BUCKET_NAME=scriptiq-content
git init
git add .
git commit -m "Deploy"
git push heroku main
BACKEND_URL=$(heroku info -s | grep web_url | cut -d= -f2)
echo "Backend deployed to: $BACKEND_URL"
cd ..
```

### Deploy Frontend (Netlify)
```bash
#!/bin/bash
cd frontend
echo "VITE_API_URL=$BACKEND_URL/api" > .env.production
npm install
npm run build
netlify deploy --prod --dir=dist
cd ..
```

## Post-Deployment

### 1. Test the Deployment

```bash
# Test backend
curl https://your-backend-url.herokuapp.com/api/options \
  -H "X-User-Name: Test User"

# Test frontend
open https://your-site-name.netlify.app
```

### 2. Update CORS Settings

If you get CORS errors, update `backend/app.py`:

```python
CORS(app, origins=[
    'https://your-site-name.netlify.app',
    'http://localhost:3000'  # For development
])
```

Redeploy the backend:
```bash
cd backend
git add .
git commit -m "Update CORS"
git push heroku main
```

### 3. Configure Custom Domain (Optional)

**Netlify:**
```bash
netlify domains:add yourdomain.com
```

**Heroku:**
```bash
heroku domains:add api.yourdomain.com
```

## Environment Variables Summary

### Backend (Heroku/Railway)
```
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket-name
```

### Frontend (Netlify)
Build-time environment variable in `.env.production`:
```
VITE_API_URL=https://your-backend-url.herokuapp.com/api
```

## Monitoring & Logs

### Heroku
```bash
heroku logs --tail --app your-content-dashboard-api
```

### Netlify
```bash
netlify logs
```

### Railway
```bash
railway logs
```

## Troubleshooting

### Backend Issues

1. **500 Error**: Check logs for Python errors
   ```bash
   heroku logs --tail
   ```

2. **S3 Access Denied**: Verify AWS credentials
   ```bash
   heroku config:get AWS_ACCESS_KEY_ID
   ```

3. **App Sleeping (Heroku Free Tier)**: Upgrade to paid plan or use Railway

### Frontend Issues

1. **API Connection Failed**: Verify `VITE_API_URL` in production build
   - Check browser console for the API URL being used
   - Ensure backend URL includes `/api` path

2. **CORS Errors**: Update CORS settings in backend and redeploy

3. **Build Failed**: Check Node version in `netlify.toml`

## Cost Estimation

### Free Tier
- **Heroku**: Free (with sleeping), $7/month for always-on
- **Railway**: $5/month credit (free for light usage)
- **Netlify**: 100GB bandwidth/month free
- **AWS S3**: $0.023/GB + $0.005/1000 requests

### Estimated Monthly Cost
- Small team (<10 users, <100GB storage): **$5-15/month**
- Medium team (100 users, 500GB storage): **$30-50/month**

## Scaling Considerations

1. **Add Database**: Replace in-memory storage with PostgreSQL
2. **Add Redis**: For session caching
3. **Enable Auto-scaling**: On Heroku/Railway
4. **CDN**: CloudFront for S3 content delivery
5. **Monitoring**: Add Sentry for error tracking

