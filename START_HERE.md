# 🎯 START HERE - Complete Deployment Guide

## Current Status

✅ **Frontend**: Deployed at https://yt-sprint.vercel.app  
❌ **Backend**: NOT DEPLOYED (this is why verticals don't load)  
❌ **Vercel Env Var**: VITE_API_URL not set

---

## 🚀 Deploy in 3 Steps (10 minutes)

### Step 1: Deploy Backend (Choose One)

#### Option A: Render (Easiest - One Click)
1. Go to: https://dashboard.render.com/select-repo?type=web
2. Connect GitHub: `SatyarthAdda247/YT-Sprint`
3. Render auto-detects `render.yaml`
4. Enter AWS credentials when prompted
5. Wait 3-5 minutes
6. **Copy the URL** (e.g., `https://yt-sprint-backend.onrender.com`)

#### Option B: Railway (Fastest - CLI)
```bash
cd /Users/adda247/Downloads/ytsprint
./deploy-backend.sh
```
Follow prompts, script does everything automatically.

#### Option C: Heroku (Production)
See [DEPLOY_NOW.md](DEPLOY_NOW.md#-option-3-heroku-requires-credit-card)

---

### Step 2: Test Backend

```bash
# Replace with your actual URL
./test-backend.sh https://YOUR-BACKEND-URL.com
```

Should show: ✅ All tests passed!

---

### Step 3: Update Vercel

#### Automated:
```bash
./update-vercel.sh https://YOUR-BACKEND-URL.com/api
```

#### Manual:
1. Go to https://vercel.com/dashboard
2. Select **yt-sprint** project
3. Settings → Environment Variables → Add New
4. Name: `VITE_API_URL`
5. Value: `https://YOUR-BACKEND-URL.com/api` ⚠️ Include `/api`
6. Save → Deployments → Redeploy

---

## ✅ Verify It Works

1. Open: https://yt-sprint.vercel.app
2. Check browser console:
   ```
   🔗 API Base URL: https://your-backend.com/api
   ```
3. Login with @adda247.com email
4. Click "Add Item"
5. Vertical dropdown shows 12 options ✅
6. Select "Bank Pre"
7. Exam dropdown populates ✅
8. Subject dropdown populates ✅

---

## 📋 Checklist

- [ ] Backend deployed to Render/Railway/Heroku
- [ ] Backend URL copied
- [ ] Backend tested with `test-backend.sh`
- [ ] Vercel `VITE_API_URL` set
- [ ] Vercel redeployed
- [ ] Frontend tested (verticals load)

---

## 📚 Detailed Guides

| Guide | Purpose |
|-------|---------|
| **[DEPLOY_NOW.md](DEPLOY_NOW.md)** | 📘 Complete deployment instructions |
| **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** | ✅ Full verification checklist |
| **[ENV_VARIABLES.md](ENV_VARIABLES.md)** | ⚙️ All environment variables |
| **[VERCEL_FIX.md](VERCEL_FIX.md)** | 🔧 Troubleshooting guide |
| **[VERTICALS_STRUCTURE.md](VERTICALS_STRUCTURE.md)** | 📊 All verticals/exams/subjects |

---

## 🆘 Quick Help

**Problem**: Verticals still empty after deployment

**Fix**:
1. Check browser console - is `VITE_API_URL` correct?
2. Test backend: `curl https://your-backend.com/api/options -H "X-User-Email: test@adda247.com"`
3. Verify Vercel env var is set
4. Hard refresh browser (Cmd+Shift+R)

**Problem**: Backend deployment failed

**Fix**:
1. Check AWS credentials are correct
2. Ensure S3 bucket exists
3. Check deployment logs in Render/Railway/Heroku
4. Try different platform

**Problem**: CORS errors

**Fix**: Already configured in `backend/app.py`, check backend logs

---

## 🎯 Expected Result

**Before**: Empty dropdowns, console shows `/api`  
**After**: 12 verticals, cascading dropdowns work, console shows backend URL

---

## ⏱️ Timeline

- Deploy backend: 5 minutes
- Test backend: 1 minute
- Update Vercel: 2 minutes
- Verify frontend: 2 minutes
- **Total**: ~10 minutes

---

## 💡 Pro Tips

1. **Save backend URL** - you'll need it later
2. **Test before updating Vercel** - ensures backend works
3. **Hard refresh browser** after Vercel redeploy
4. **Check console first** when debugging

---

## 🚀 Ready to Deploy?

Choose your platform and go to [DEPLOY_NOW.md](DEPLOY_NOW.md) for detailed instructions!

**Recommended for beginners**: Render (Option A)  
**Recommended for speed**: Railway script (Option B)  
**Recommended for production**: Heroku (Option C)

