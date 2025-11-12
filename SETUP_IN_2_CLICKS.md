# 🎯 Setup in 2 Clicks - No CLI Required!

## Click 1: Deploy Backend (Render)

### ✅ One-Click Deploy Button

**Click this button** to deploy backend automatically:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/SatyarthAdda247/YT-Sprint)

### What happens:
1. Opens Render dashboard
2. Detects `render.yaml` config automatically
3. Asks for AWS credentials (one-time)
4. Deploys backend in ~3 minutes
5. Gives you a URL like: `https://yt-sprint-backend.onrender.com`

### Required Info (have ready):
- AWS Access Key ID
- AWS Secret Access Key
- S3 Bucket Name

**💾 Save the backend URL** - you'll need it in Click 2!

---

## Click 2: Update Vercel (2 ways)

### Option A: Vercel Dashboard (Manual - 2 minutes)

1. **Go to**: https://vercel.com/dashboard
2. **Select**: `yt-sprint` project  
3. **Go to**: Settings → Environment Variables
4. **Click**: "Add New"
5. **Enter**:
   - Name: `VITE_API_URL`
   - Value: `https://YOUR-BACKEND-URL.onrender.com/api` (from Click 1)
   - Environments: Select ALL (Production, Preview, Development)
6. **Save** then **Redeploy** (Deployments tab)

### Option B: Use Script (Faster)

```bash
cd /Users/adda247/Downloads/ytsprint
./update-vercel.sh https://yt-sprint-backend.onrender.com/api
```

---

## ✅ Done! Verify

1. Open: https://yt-sprint.vercel.app
2. Check console: Should show backend URL, not `/api`
3. Login and try adding item
4. Vertical dropdown should have 12 options

---

## 🎯 That's It!

**Total time**: 5-7 minutes  
**Complexity**: Just 2 clicks + copy/paste  
**Cost**: $0 (Free tier on both platforms)

---

## 🆘 Issues?

**Backend URL shows error**: Wait 2-3 minutes, Render is still starting

**Verticals still empty**: 
- Check Vercel env var is saved
- Click "Redeploy" in Vercel
- Hard refresh browser (Cmd+Shift+R)

**Backend won't deploy**: Check AWS credentials are correct

---

## Alternative: Manual Setup (If button doesn't work)

### Deploy Backend Manually on Render

1. Go to: https://dashboard.render.com/select-repo?type=web
2. Connect GitHub account
3. Select: `SatyarthAdda247/YT-Sprint`
4. Render auto-detects `render.yaml`
5. Enter AWS credentials
6. Click "Create Web Service"
7. Copy URL when done

Then proceed to Click 2 above.

