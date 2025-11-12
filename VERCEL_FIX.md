# Vercel Production Fix - Verticals Not Loading

## Problem
Vertical names, exam names, and subjects are not loading on Vercel but work locally.

## Root Cause
- **Local**: Vite proxy forwards `/api` → `http://localhost:5001`
- **Vercel**: No proxy, needs `VITE_API_URL` environment variable set

## Fix Steps

### Step 1: Set Environment Variable on Vercel

1. Go to https://vercel.com/dashboard
2. Select your `yt-sprint` project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `YOUR_BACKEND_URL/api` (see Step 2)
   - **Environments**: Production, Preview, Development (select all)
5. Click **Save**

### Step 2: Get Your Backend URL

Your backend needs to be deployed. Check where it's deployed:

**Option A: Already Deployed?**
- Check if you have a Heroku/Railway/Render backend deployed
- Look for URL in your deployment platform dashboard
- Format: `https://your-backend.herokuapp.com/api` or `https://your-backend.up.railway.app/api`

**Option B: Need to Deploy Backend?**
Deploy backend to one of these platforms:

#### Railway (Recommended - Free)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up
```

#### Heroku
```bash
cd backend
heroku create yt-sprint-backend
git push heroku main
```

### Step 3: Redeploy Vercel

After setting `VITE_API_URL`:
1. Go to **Deployments** tab in Vercel
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**

## Quick Check

Test if backend is accessible:
```bash
curl YOUR_BACKEND_URL/api/options -H "X-User-Email: test@adda247.com"
```

Should return JSON with verticals, exams, subjects.

## Current Backend Status

Your backend has:
- ✅ `Procfile` for Heroku/Railway
- ✅ `requirements.txt` with dependencies
- ✅ `/api/options` endpoint in `app.py`
- ❌ Not deployed (needs deployment)

## Alternative: Quick Test with Mock Data

If backend isn't ready, temporarily modify frontend to use fallback:

```javascript
// In App.jsx, modify loadOptions:
const loadOptions = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/options`)
    setOptions({
      verticals: data.verticals || [],
      categories_by_vertical: data.categories_by_vertical || {},
      subjects_by_vertical: data.subjects_by_vertical || {},
      content_subcategories: data.content_subcategories || []
    })
  } catch (err) {
    console.error('Failed to load options:', err)
    // Fallback to hardcoded options
    const { MASTER_DATA } = await import('./masterData')
    setOptions(MASTER_DATA)
  }
}
```

