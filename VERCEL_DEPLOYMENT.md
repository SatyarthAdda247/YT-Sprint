# Vercel Deployment Guide

## Frontend Deployment (Current Issue Fix)

### Problem
Getting 404 errors on https://yt-sprint.vercel.app/ because Vercel doesn't know how to build the Vite app.

### Solution

#### Option 1: Redeploy with Updated Config (Recommended)

1. **Push the new `vercel.json` to GitHub** (already done):
```bash
git add vercel.json .vercelignore
git commit -m "Add Vercel configuration"
git push
```

2. **In Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Find your `yt-sprint` project
   - Go to Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL = https://your-backend-url.com/api
     ```
   - Go to Deployments
   - Click "Redeploy" on the latest deployment
   - Or trigger new deployment by pushing to GitHub

#### Option 2: Configure Manually in Vercel

1. **Go to Project Settings**:
   - Navigate to https://vercel.com/dashboard
   - Select `yt-sprint` project
   - Go to Settings → General

2. **Build & Development Settings**:
   ```
   Framework Preset: Other
   Build Command: cd frontend && npm install && npm run build
   Output Directory: frontend/dist
   Install Command: npm install
   ```

3. **Root Directory**:
   - Leave as `.` (root)

4. **Environment Variables**:
   - Add `VITE_API_URL` with your backend URL

5. **Redeploy**

#### Option 3: Deploy Frontend Only

If you want to deploy only the frontend directory:

1. **In Vercel Dashboard**:
   - Settings → General → Root Directory
   - Set to: `frontend`

2. **Build Settings**:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables**:
   ```
   VITE_API_URL = https://your-backend-url.com/api
   ```

---

## Backend Deployment

The backend needs to be deployed separately. Options:

### Option A: Railway

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Deploy Backend**:
```bash
cd backend
railway login
railway init
railway up
```

3. **Get Backend URL**:
```bash
railway status
# Copy the URL (e.g., https://yt-sprint-backend.up.railway.app)
```

4. **Update Vercel Environment Variable**:
   - Set `VITE_API_URL` to your Railway backend URL + `/api`

### Option B: Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
   - Environment: Python 3
5. Add Environment Variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `S3_BUCKET_NAME`
6. Deploy
7. Copy the URL and update Vercel's `VITE_API_URL`

### Option C: Heroku

```bash
cd backend
heroku create yt-sprint-backend
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
heroku config:set AWS_REGION=ap-south-1
heroku config:set S3_BUCKET_NAME=your-bucket
git push heroku main
```

---

## Quick Fix Checklist

- [x] Created `vercel.json` with build configuration
- [x] Created `.vercelignore` to exclude backend
- [ ] Push to GitHub: `git push`
- [ ] Set `VITE_API_URL` in Vercel dashboard
- [ ] Redeploy in Vercel dashboard
- [ ] Deploy backend to Railway/Render/Heroku
- [ ] Update `VITE_API_URL` with backend URL
- [ ] Test at https://yt-sprint.vercel.app/

---

## Troubleshooting

### Still Getting 404?

1. **Check Build Logs** in Vercel:
   - Go to Deployments
   - Click on latest deployment
   - Check logs for errors

2. **Verify Output Directory**:
   - Build logs should show files in `frontend/dist`
   - Should see `index.html`, `assets/` folder

3. **Check Environment Variables**:
   - Make sure `VITE_API_URL` is set
   - Vite env vars must start with `VITE_`

### CORS Errors?

Add to `backend/app.py`:
```python
from flask_cors import CORS

CORS(app, origins=[
    'http://localhost:3000',
    'https://yt-sprint.vercel.app'
])
```

---

## Current Setup

**Frontend**: Vercel (https://yt-sprint.vercel.app)
**Backend**: Needs deployment
**Repository**: https://github.com/SatyarthAdda247/YT-Sprint

After backend is deployed, update the frontend's `VITE_API_URL` environment variable in Vercel.

