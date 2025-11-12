# 🚀 Vercel Deployment Guide - Optimized

This guide will help you deploy the YT Sprint dashboard to Vercel with optimal performance.

## ✅ Pre-deployment Checklist

- [x] `vercel.json` configured with build settings
- [x] Frontend optimized with Vite build settings
- [x] Security headers configured
- [x] Asset caching enabled
- [x] Code splitting configured
- [x] Console logs removed in production

## 📋 Quick Deploy Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub** (already done):
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select `SatyarthAdda247/YT-Sprint`
   - Click "Import"

3. **Configure Build Settings**:
   Vercel should auto-detect from `vercel.json`, but verify:
   
   ```
   Framework Preset: Other
   Root Directory: . (leave as root)
   Build Command: cd frontend && npm ci && npm run build
   Output Directory: frontend/dist
   Install Command: cd frontend && npm ci
   ```

4. **Add Environment Variable**:
   - Go to Settings → Environment Variables
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.com/api
     ```
   - Important: Use your actual backend URL (see Backend Deployment section)

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🎉

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd /Users/adda247/Downloads/ytsprint
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: yt-sprint
# - Which directory? ./
# - Override settings? No

# Set environment variable
vercel env add VITE_API_URL
# Enter: https://your-backend-url.com/api

# Deploy to production
vercel --prod
```

## 🔧 Backend Deployment Options

Your backend needs to be deployed separately. Choose one:

### Option A: Railway (Fastest)

```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set AWS_ACCESS_KEY_ID=your_key
railway variables set AWS_SECRET_ACCESS_KEY=your_secret
railway variables set AWS_REGION=ap-south-1
railway variables set S3_BUCKET_NAME=your-bucket

# Deploy
railway up

# Get URL
railway status
# Copy the URL (e.g., https://yt-sprint-backend.up.railway.app)
```

**After deployment**:
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Update `VITE_API_URL` to: `https://yt-sprint-backend.up.railway.app/api`
4. Redeploy frontend

### Option B: Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Name: `yt-sprint-backend`
   - Root Directory: `backend`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Add Environment Variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `S3_BUCKET_NAME`
6. Click "Create Web Service"
7. Copy the URL and update Vercel's `VITE_API_URL`

### Option C: Heroku

```bash
cd backend

# Login
heroku login

# Create app
heroku create yt-sprint-backend

# Set environment variables
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
heroku config:set AWS_REGION=ap-south-1
heroku config:set S3_BUCKET_NAME=your-bucket

# Deploy
git subtree push --prefix backend heroku main

# Get URL
heroku info
```

## ⚡ Performance Optimizations (Already Applied)

### Build Optimizations
✅ **Code Splitting**: React and Axios split into separate chunks
✅ **Minification**: Terser minification with console.log removal
✅ **Tree Shaking**: Unused code automatically removed
✅ **Asset Optimization**: Images and assets optimized

### Caching Strategy
✅ **Static Assets**: 1 year cache with immutable flag
✅ **HTML**: No cache (always fresh)
✅ **API Calls**: Not cached (real-time data)

### Security Headers
✅ **X-Content-Type-Options**: nosniff
✅ **X-Frame-Options**: DENY
✅ **X-XSS-Protection**: 1; mode=block

### Network Optimization
✅ **Region**: Mumbai (bom1) - closest to India
✅ **DNS Prefetch**: Google Fonts pre-resolved
✅ **Preconnect**: Faster font loading

## 📊 Expected Build Output

```
✓ built in 15-20s
dist/index.html                   1.2 kB
dist/assets/react-vendor.js      150 kB  (gzip: 48 kB)
dist/assets/axios-vendor.js       25 kB  (gzip: 9 kB)
dist/assets/index.js              45 kB  (gzip: 15 kB)
dist/assets/index.css             12 kB  (gzip: 3 kB)
```

**Total Size**: ~72 kB (gzipped) ⚡

## 🔍 Troubleshooting

### Build Fails

**Error**: "Module not found"
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error**: "Command failed"
- Check `vercel.json` syntax
- Verify `buildCommand` path is correct
- Check build logs in Vercel dashboard

### 404 Errors

**Problem**: Routes return 404
- ✅ Already fixed with rewrites in `vercel.json`
- All routes redirect to `/index.html`

**Problem**: Assets not loading
- Check `outputDirectory` is set to `frontend/dist`
- Verify build completed successfully

### CORS Errors

**Problem**: API calls blocked
```python
# Add to backend/app.py
from flask_cors import CORS

CORS(app, origins=[
    'http://localhost:3000',
    'https://yt-sprint.vercel.app',
    'https://*.vercel.app'  # All Vercel preview URLs
])
```

### Environment Variables Not Working

**Problem**: `VITE_API_URL` undefined
- Vite env vars MUST start with `VITE_`
- Redeploy after adding env vars
- Check spelling and case sensitivity

## 🌍 Custom Domain (Optional)

1. Go to Vercel Dashboard → Domains
2. Click "Add"
3. Enter your domain (e.g., `sprint.adda247.com`)
4. Add DNS records as instructed:
   ```
   Type: CNAME
   Name: sprint
   Value: cname.vercel-dns.com
   ```
5. Wait for DNS propagation (5-30 minutes)
6. Update CORS in backend to include new domain

## 📱 Testing Deployment

After deployment, test these scenarios:

### Frontend Tests
- [ ] Open https://yt-sprint.vercel.app
- [ ] Login/Signup works
- [ ] Dropdowns populate correctly
- [ ] Can submit form
- [ ] YouTube duplicate detection works
- [ ] Video file upload works (Re-edit status)

### API Integration Tests
```bash
# Test from deployed frontend
# Open browser console and run:
axios.get('https://your-backend-url.com/api/options')
  .then(r => console.log('API Working:', r.data))
  .catch(e => console.error('API Error:', e))
```

### Performance Tests
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors

## 🔄 Continuous Deployment

Once connected, Vercel auto-deploys on:
- ✅ Push to `main` branch → Production
- ✅ Push to other branches → Preview URLs
- ✅ Pull requests → Preview deployments

To disable auto-deploy:
1. Settings → Git
2. Uncheck "Production Branch"

## 📈 Monitoring

### Vercel Analytics (Free)
1. Settings → Analytics
2. Enable Web Analytics
3. View real-time traffic, performance, and errors

### Key Metrics to Watch
- **Build Time**: Should be < 30s
- **Bundle Size**: Should be < 500 kB
- **First Paint**: Should be < 2s
- **Error Rate**: Should be < 1%

## 🎯 Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway/Render/Heroku)
- [ ] `VITE_API_URL` configured in Vercel
- [ ] CORS configured in backend
- [ ] Test login/signup
- [ ] Test form submission
- [ ] Test YouTube duplicate detection
- [ ] Test video upload (Re-edit)
- [ ] Test all dropdowns
- [ ] Lighthouse score checked
- [ ] Share URL with team

## 🆘 Support

**Vercel Issues**: https://vercel.com/support
**Project Repository**: https://github.com/SatyarthAdda247/YT-Sprint
**Documentation**: See `README.md` and `CHANGELOG.md`

---

## 🎉 Success!

Your app should now be live at:
- **Production**: https://yt-sprint.vercel.app
- **Backend**: https://your-backend-url.com

Share the URL and start tracking YouTube content! 🚀

