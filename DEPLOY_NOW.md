# 🚀 Deploy Backend NOW - Step by Step

Your backend is **NOT deployed** yet. This is why verticals aren't loading on Vercel.

Choose **ONE** option below:

---

## ⚡ Option 1: One-Click Deploy (Render) - EASIEST

### Step 1: Click Deploy Button

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/SatyarthAdda247/YT-Sprint)

Or manually:

1. Go to: https://dashboard.render.com/select-repo?type=web
2. Connect GitHub account
3. Select repository: `SatyarthAdda247/YT-Sprint`
4. Render will detect `render.yaml` automatically

### Step 2: Configure Environment Variables

When prompted, enter:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `S3_BUCKET_NAME`: Your S3 bucket name

### Step 3: Wait for Deployment (2-3 minutes)

Render will:
- ✅ Install Python dependencies
- ✅ Start gunicorn server
- ✅ Give you a URL like: `https://yt-sprint-backend.onrender.com`

### Step 4: Copy Backend URL

Once deployed, copy the URL from Render dashboard.

---

## ⚡ Option 2: Railway (Fastest - 5 minutes)

### Run This Command:

```bash
cd /Users/adda247/Downloads/ytsprint
./deploy-backend.sh
```

This script will:
1. ✅ Login to Railway (opens browser)
2. ✅ Initialize project
3. ✅ Deploy backend
4. ✅ Ask for AWS credentials
5. ✅ Set environment variables
6. ✅ Show you the backend URL

### Manual Steps:

```bash
# 1. Login
railway login

# 2. Initialize and deploy
cd backend
railway init
railway up

# 3. Set environment variables
railway variables set AWS_ACCESS_KEY_ID=your_key
railway variables set AWS_SECRET_ACCESS_KEY=your_secret
railway variables set AWS_REGION=ap-south-1
railway variables set S3_BUCKET_NAME=your_bucket

# 4. Get URL
railway domain
```

Copy the URL shown (e.g., `https://yt-sprint-backend.up.railway.app`)

---

## ⚡ Option 3: Heroku (Requires Credit Card)

```bash
# 1. Login
heroku login

# 2. Create app
cd /Users/adda247/Downloads/ytsprint
heroku create yt-sprint-backend

# 3. Set environment variables
heroku config:set AWS_ACCESS_KEY_ID=your_key -a yt-sprint-backend
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret -a yt-sprint-backend
heroku config:set AWS_REGION=ap-south-1 -a yt-sprint-backend
heroku config:set S3_BUCKET_NAME=your_bucket -a yt-sprint-backend

# 4. Deploy
git subtree push --prefix backend heroku main

# 5. Get URL
heroku open -a yt-sprint-backend
```

Copy the URL (e.g., `https://yt-sprint-backend.herokuapp.com`)

---

## 🔧 After Backend is Deployed

### Test Backend First

```bash
# Replace with your actual backend URL
curl https://YOUR-BACKEND-URL.com/api/options \
  -H "X-User-Email: test@adda247.com"
```

Should return JSON with verticals, exams, subjects.

### Update Vercel (Choose One)

#### Option A: Automated Script

```bash
cd /Users/adda247/Downloads/ytsprint
./update-vercel.sh https://YOUR-BACKEND-URL.com/api
```

#### Option B: Manual (Vercel Dashboard)

1. Go to https://vercel.com/dashboard
2. Select **yt-sprint** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Set:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://YOUR-BACKEND-URL.com/api` ⚠️ Include `/api`
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**
7. Go to **Deployments** tab
8. Click **⋯** (three dots) on latest deployment
9. Click **Redeploy**

#### Option C: Vercel CLI

```bash
vercel env add VITE_API_URL production
# Paste: https://YOUR-BACKEND-URL.com/api

vercel --prod
```

---

## ✅ Verify Everything Works

### 1. Check Frontend Console

Open https://yt-sprint.vercel.app and check browser console:

```javascript
// Should see:
🔗 API Base URL: https://your-backend-url.com/api
🔗 VITE_API_URL: https://your-backend-url.com/api

// NOT:
🔗 API Base URL: /api  ❌
```

### 2. Test Dropdown

1. Login with @adda247.com email
2. Click "Add Item"
3. Vertical dropdown should show 12 options:
   - Bank Pre, Bank Post, SSC, Teaching, UGC, Bihar, Punjab, Odia, Telugu, Tamil, Bengal, Agriculture

### 3. Test Cascading Dropdowns

1. Select "Bank Pre" as vertical
2. Exam dropdown should populate with: SBI Clerk, SBI PO, IBPS CLERK, etc.
3. Subject dropdown should populate with: Reasoning, Quants, English, etc.

---

## 🆘 Troubleshooting

### Backend Deployment Fails

**Error**: "Failed to build"
- Check `backend/requirements.txt` exists
- Ensure `backend/Procfile` contains: `web: gunicorn app:app`

**Error**: "Port already in use"
- Railway/Render auto-assign ports, this shouldn't happen

### Vercel Still Shows `/api`

**Cause**: Environment variable not set or not redeployed

**Fix**:
1. Double-check `VITE_API_URL` is set in Vercel Settings
2. Ensure you clicked "Save"
3. Redeploy the frontend
4. Hard refresh browser (Cmd+Shift+R)

### Dropdowns Still Empty

**Cause**: Backend not accessible

**Fix**:
1. Test backend directly with curl command above
2. Check CORS in backend `app.py` (already configured)
3. Check AWS credentials are correct
4. Check S3 bucket exists and is accessible

### CORS Errors

**Already Fixed** in `backend/app.py`:
```python
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

If still occurring, check backend logs.

---

## 📊 Expected Timeline

- **Render**: 3-5 minutes (one-click)
- **Railway**: 5-7 minutes (with script)
- **Heroku**: 5-10 minutes (manual)
- **Update Vercel**: 2-3 minutes
- **Total**: ~10 minutes end-to-end

---

## 🎯 Quick Start (Recommended)

**For beginners**: Use Render (Option 1)
**For speed**: Use Railway script (Option 2)
**For production**: Use Heroku (Option 3)

**Need help?** Check:
- `DEPLOYMENT_CHECKLIST.md`
- `ENV_VARIABLES.md`
- `VERCEL_FIX.md`

