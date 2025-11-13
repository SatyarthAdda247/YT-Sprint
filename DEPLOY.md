# 🚀 Deployment Guide - Choose Your Method

## ⚡ **ONE COMMAND - FULLY AUTOMATED** (Recommended)

Deploys backend + configures Vercel automatically:

```bash
./one-command-deploy.sh
```

This will:
1. ✅ Auto-detect Railway/Heroku CLI
2. ✅ Deploy backend automatically
3. ✅ Set AWS credentials
4. ✅ Configure Vercel environment variable
5. ✅ Redeploy frontend
6. ✅ Done!

**Time:** 5-10 minutes

---

## 🎯 **STEP BY STEP - AUTOMATED**

### Deploy Backend Only

Choose your platform:

#### Railway
```bash
./deploy-auto.sh
```

#### Render
```bash
./deploy-render-cli.sh
# Then use web dashboard
```

#### Heroku
```bash
./deploy-auto.sh
# Auto-detects Heroku if Railway not found
```

### Update Vercel

```bash
./update-vercel-auto.sh https://your-backend-url.railway.app/api
```

---

## 📋 **Prerequisites**

Install ONE of these CLIs:

### Railway (Recommended)
```bash
npm i -g @railway/cli
railway login
```

### Heroku
```bash
brew install heroku/brew/heroku
# or: curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

### Vercel
```bash
npm i -g vercel
vercel login
```

---

## 🛠️ **Manual Deployment**

If you prefer manual control:

### 1. Render (No CLI needed)

Go to: https://dashboard.render.com/select-repo?type=web

- Connect: `SatyarthAdda247/YT-Sprint`
- Root Directory: `backend`
- Add AWS credentials
- Deploy

### 2. Railway (Web Dashboard)

Go to: https://railway.app/new

- Deploy from GitHub
- Select: `SatyarthAdda247/YT-Sprint`
- Root Directory: `backend`
- Add AWS credentials
- Generate domain

### 3. Vercel

Go to: https://vercel.com/dashboard

- Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-backend-url.com/api`
- Redeploy

---

## ✅ **What You Need**

Before running any script:

- ✅ AWS Access Key ID
- ✅ AWS Secret Access Key
- ✅ S3 Bucket Name
- ✅ AWS Region (default: ap-south-1)

---

## 🧪 **Test Deployment**

After deployment, test:

```bash
./test-backend.sh https://your-backend-url.railway.app
```

Should show:
- ✅ Backend responding
- ✅ 12 verticals found
- ✅ Exams and subjects loaded

---

## 🔧 **Troubleshooting**

### Backend deployment fails

```bash
# Check logs
railway logs  # Railway
heroku logs --tail -a your-app  # Heroku
```

### Vercel not updating

```bash
# Force redeploy
vercel --prod --force
```

### Test backend directly

```bash
curl https://your-backend-url.com/api/options \
  -H "X-User-Email: test@adda247.com"
```

---

## 📊 **Deployment Matrix**

| Platform | Time | Difficulty | Cost |
|----------|------|------------|------|
| **Railway** | 5 min | Easy | Free* |
| **Render** | 5 min | Easy | Free |
| **Heroku** | 7 min | Medium | Requires card |
| **Vercel** | 2 min | Easy | Free |

*Railway: $5 free credit monthly

---

## 🎯 **Recommended Flow**

### For Beginners
```bash
./one-command-deploy.sh
```

### For Developers
```bash
./deploy-auto.sh          # Deploy backend
./update-vercel-auto.sh   # Configure Vercel
```

### For Manual Control
Use Render web dashboard + Vercel dashboard

---

## 📚 **Script Reference**

| Script | Purpose |
|--------|---------|
| `one-command-deploy.sh` | Full automated deployment |
| `deploy-auto.sh` | Backend only (Railway/Heroku) |
| `update-vercel-auto.sh` | Vercel configuration |
| `deploy-render-cli.sh` | Render helper |
| `test-backend.sh` | Test deployment |

---

## ⚡ **Quick Start**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy everything
./one-command-deploy.sh

# Done!
```

**Your app will be live at:** https://yt-sprint.vercel.app

