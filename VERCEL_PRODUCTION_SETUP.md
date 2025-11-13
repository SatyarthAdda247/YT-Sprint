# Vercel Production Setup - Complete Guide

## ✅ Current Configuration Status

### Frontend (Vercel)
- ✅ `vercel.json` configured
- ✅ Build command: `cd frontend && npm ci && npm run build`
- ✅ Output directory: `frontend/dist`
- ✅ SPA routing configured (rewrites)
- ✅ Security headers enabled
- ✅ Asset caching optimized
- ⚠️ **REQUIRED**: `VITE_API_URL` environment variable

### Backend
- ✅ Ready for deployment (Railway/Render/Heroku)
- ✅ `Procfile` configured
- ✅ `render.yaml` for one-click Render deployment
- ✅ CORS enabled for Vercel
- ⚠️ **NOT DEPLOYED** - See deployment steps below

---

## 🚀 Complete Deployment Steps

### Step 1: Deploy Backend

#### Option A: Render (Recommended)

1. **One-Click Deploy**:
   - Click: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/SatyarthAdda247/YT-Sprint)
   - Or go to: https://dashboard.render.com/select-repo?type=web
   - Select: `SatyarthAdda247/YT-Sprint`

2. **Configure Environment Variables**:
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=ap-south-1
   S3_BUCKET_NAME=your_bucket_name
   ```

3. **Wait for Deployment** (3-5 minutes)

4. **Copy Backend URL**: e.g., `https://yt-sprint-backend.onrender.com`

#### Option B: Railway

```bash
cd /Users/adda247/Downloads/ytsprint
./deploy-backend.sh
# Follow prompts
```

---

### Step 2: Configure Vercel Environment Variable

#### Method 1: Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Select project: **yt-sprint**
3. Navigate to: **Settings** → **Environment Variables**
4. Click: **Add New**
5. Configure:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://YOUR-BACKEND-URL.onrender.com/api` ⚠️ Must include `/api`
   - **Environments**: Select **ALL** (Production, Preview, Development)
6. Click: **Save**

#### Method 2: Vercel CLI

```bash
cd /Users/adda247/Downloads/ytsprint
./update-vercel.sh https://YOUR-BACKEND-URL.onrender.com/api
```

---

### Step 3: Redeploy Frontend

#### Option A: Vercel Dashboard

1. Go to: **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click: **Redeploy**
4. Select: **Use existing Build Cache** (faster)

#### Option B: Push to GitHub

```bash
git push origin main
# Vercel auto-deploys
```

#### Option C: Vercel CLI

```bash
cd frontend
vercel --prod
```

---

## ✅ Verification Steps

### 1. Check Environment Variable

Open: https://yt-sprint.vercel.app

**Browser Console should show**:
```javascript
🔗 API Base URL: https://yt-sprint-backend.onrender.com/api
🔗 VITE_API_URL: https://yt-sprint-backend.onrender.com/api
```

**NOT**:
```javascript
🔗 API Base URL: /api  ❌
🔗 VITE_API_URL: undefined  ❌
```

### 2. Test Backend Connection

```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/options \
  -H "X-User-Email: test@adda247.com"
```

Should return JSON with verticals, exams, subjects.

### 3. Test Frontend Features

1. ✅ Login with @adda247.com email
2. ✅ Vertical dropdown shows 12 options
3. ✅ Select "Bank Pre" → Exams populate
4. ✅ Exams show → Subjects populate
5. ✅ Can add new entry
6. ✅ Table displays entries
7. ✅ Export works

---

## 🔧 Production Optimizations

### Vercel Configuration (Already Done)

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm ci && npm run build",
  "outputDirectory": "frontend/dist",
  "regions": ["bom1"],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Frontend Build Optimizations (Already Done)

- ✅ Code splitting (React & Axios vendors separate)
- ✅ Console logs removed in production
- ✅ Minification enabled (Terser)
- ✅ Source maps disabled
- ✅ Asset optimization

### Backend CORS (Already Configured)

```python
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "X-User-Email"]
    }
})
```

---

## 🆘 Troubleshooting

### Issue: Verticals Not Loading

**Symptoms**: Empty dropdowns, console shows `/api`

**Cause**: `VITE_API_URL` not set in Vercel

**Fix**:
1. Set environment variable in Vercel (Step 2)
2. Redeploy (Step 3)
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)

### Issue: 404 on API Calls

**Symptoms**: Network errors, 404 responses

**Cause**: Backend not deployed or URL incorrect

**Fix**:
1. Deploy backend (Step 1)
2. Verify backend URL includes `/api` suffix
3. Test backend directly with curl

### Issue: CORS Errors

**Symptoms**: CORS policy error in console

**Cause**: Backend CORS not configured (already fixed in code)

**Fix**:
- Already configured in `backend/app.py`
- Ensure backend is redeployed with latest code

### Issue: Build Fails on Vercel

**Symptoms**: Deployment fails during build

**Cause**: Dependencies missing or build command incorrect

**Fix**:
1. Check `vercel.json` build command
2. Ensure `frontend/package.json` has all deps
3. Check build logs in Vercel dashboard

---

## 📊 Performance Metrics

### Target Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

### Current Optimizations
- ✅ Asset caching (1 year)
- ✅ Code splitting
- ✅ Minification
- ✅ Mumbai region (low latency for India)
- ✅ Security headers

---

## 🔐 Security Checklist

- ✅ Email domain validation (@adda247.com, @addaeducation.com, @studyiq.com)
- ✅ User ownership validation (edit/delete)
- ✅ S3 presigned URLs for downloads
- ✅ Security headers (XSS, MIME, Frame)
- ✅ HTTPS enforced by Vercel
- ⚠️ CORS set to `*` (restrict in production if needed)

---

## 📝 Environment Variables Summary

### Required on Vercel (Frontend)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Required on Backend Platform (Railway/Render/Heroku)
```
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-south-1
S3_BUCKET_NAME=xxx
```

---

## 🎯 Quick Command Reference

```bash
# Test backend
./test-backend.sh https://YOUR-BACKEND-URL.com

# Update Vercel
./update-vercel.sh https://YOUR-BACKEND-URL.com/api

# Deploy backend (Railway)
./deploy-backend.sh

# Local development
cd frontend && npm run dev
cd backend && python app.py
```

---

## 📚 Additional Resources

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Render Dashboard](https://dashboard.render.com)
- [Railway Dashboard](https://railway.app)
- [START_HERE.md](START_HERE.md) - Quick start guide
- [DEPLOY_NOW.md](DEPLOY_NOW.md) - Detailed deployment
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Full checklist

---

## ✅ Production Readiness Checklist

- [ ] Backend deployed and accessible
- [ ] Backend URL copied
- [ ] `VITE_API_URL` set in Vercel
- [ ] Vercel frontend redeployed
- [ ] Console shows correct API URL
- [ ] Verticals load (12 options)
- [ ] Cascading dropdowns work
- [ ] Can add entries
- [ ] Can view entries in table
- [ ] Export works
- [ ] Edit/Delete work
- [ ] Mobile responsive
- [ ] Performance tested

---

**Current Status**: Frontend configured ✅ | Backend needs deployment ⚠️

**Next Action**: Deploy backend → Set `VITE_API_URL` → Redeploy Vercel

