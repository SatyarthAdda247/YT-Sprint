# Deployment Checklist

Use this checklist to ensure proper deployment of frontend and backend.

## 🔴 Critical Issues to Fix

### Issue: Verticals/Exams/Subjects not loading on Vercel

**Status**: ⚠️ NEEDS FIX

**Root Cause**: 
- `VITE_API_URL` environment variable not set in Vercel
- Backend API not accessible from production

**Required Actions**:

- [ ] **1. Deploy Backend** (choose one platform)
  - [ ] Railway (recommended, free)
  - [ ] Heroku (requires credit card)
  - [ ] Render (free tier available)
  
- [ ] **2. Get Backend URL**
  - [ ] Note down the deployed backend URL (e.g., `https://xxx.railway.app`)
  
- [ ] **3. Set Vercel Environment Variable**
  - [ ] Go to Vercel Dashboard → Settings → Environment Variables
  - [ ] Add: `VITE_API_URL` = `YOUR_BACKEND_URL/api`
  - [ ] Save and ensure it's applied to all environments
  
- [ ] **4. Test Backend**
  ```bash
  curl YOUR_BACKEND_URL/api/options \
    -H "X-User-Email: test@adda247.com"
  ```
  - [ ] Should return JSON with verticals/exams/subjects
  
- [ ] **5. Redeploy Vercel**
  - [ ] Go to Deployments tab
  - [ ] Click redeploy on latest deployment
  
- [ ] **6. Verify Production**
  - [ ] Open browser console on https://yt-sprint.vercel.app
  - [ ] Check for API Base URL log (should show your backend URL, not `/api`)
  - [ ] Try selecting a vertical - should populate exams/subjects

---

## Backend Deployment

### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project in backend folder
cd backend
railway init

# Deploy
railway up

# Set environment variables
railway variables set AWS_ACCESS_KEY_ID=xxx
railway variables set AWS_SECRET_ACCESS_KEY=xxx
railway variables set AWS_REGION=ap-south-1
railway variables set S3_BUCKET_NAME=xxx

# Get the URL
railway open
```

### Option B: Heroku

```bash
# Login
heroku login

# Create app
cd backend
heroku create yt-sprint-backend

# Set environment variables
heroku config:set AWS_ACCESS_KEY_ID=xxx
heroku config:set AWS_SECRET_ACCESS_KEY=xxx
heroku config:set AWS_REGION=ap-south-1
heroku config:set S3_BUCKET_NAME=xxx

# Deploy
git subtree push --prefix backend heroku main

# Get URL
heroku open
```

### Option C: Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: yt-sprint-backend
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Add Environment Variables (AWS credentials)
6. Deploy

---

## Frontend Deployment

### Vercel Settings

**Current Status**: ✅ Deployed
**URL**: https://yt-sprint.vercel.app

**Required Environment Variables**:
- `VITE_API_URL`: ⚠️ NEEDS TO BE SET

**Build Settings** (already configured in `vercel.json`):
- Build Command: `cd frontend && npm ci && npm run build`
- Output Directory: `frontend/dist`
- Framework: Other

---

## Quick Debugging

### Check Frontend API URL

Open browser console on Vercel deployment:
```javascript
// Should see:
🔗 API Base URL: https://your-backend.railway.app/api
🔗 VITE_API_URL: https://your-backend.railway.app/api

// If you see:
🔗 API Base URL: /api
🔗 VITE_API_URL: undefined
// Then VITE_API_URL is NOT set in Vercel!
```

### Check Backend Health

```bash
# Test if backend is responding
curl https://your-backend-url.com/api/options \
  -H "X-User-Email: test@adda247.com"

# Should return:
{
  "verticals": ["Bank Pre", "Bank Post", "SSC", ...],
  "categories_by_vertical": {...},
  "subjects_by_vertical": {...},
  "content_subcategories": [...]
}
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Failed to load verticals/exams" | VITE_API_URL not set | Set in Vercel, redeploy |
| CORS errors | Backend CORS not configured | Already configured in `app.py` |
| 401 Unauthorized | Email header missing/invalid | Use @adda247.com/@addaeducation.com/@studyiq.com email |
| 404 on options endpoint | Backend not deployed | Deploy backend first |

---

## Post-Deployment Testing

- [ ] Frontend loads without errors
- [ ] Can login with @adda247.com email
- [ ] Vertical dropdown shows 12 options
- [ ] Selecting vertical populates exams
- [ ] Selecting vertical populates subjects
- [ ] Can add new item
- [ ] Can view existing items
- [ ] Can filter by vertical/exam/subject
- [ ] Can upload files
- [ ] Console shows correct API_BASE URL

---

## Environment Variables Summary

### Vercel (Frontend)
```
VITE_API_URL=https://your-backend.railway.app/api
```

### Backend (Railway/Heroku/Render)
```
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket-name
```

---

## Support Files

- 📄 `VERCEL_FIX.md` - Detailed fix instructions
- 📄 `ENV_VARIABLES.md` - All environment variables explained
- 📄 `VERTICALS_STRUCTURE.md` - All available verticals/exams/subjects

