# Environment Variables Configuration

## Frontend (Vercel)

### Required Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Value | Environments |
|----------|-------|--------------|
| `VITE_API_URL` | `https://your-backend-url.com/api` | Production, Preview, Development |

### Example Values:
- **Heroku**: `https://yt-sprint-backend.herokuapp.com/api`
- **Railway**: `https://yt-sprint-backend.up.railway.app/api`
- **Render**: `https://yt-sprint-backend.onrender.com/api`

### Local Development
No need to set `VITE_API_URL` locally - Vite proxy handles it (see `vite.config.js`).

---

## Backend (Heroku/Railway/Render)

### Required Environment Variables

Set these in your backend hosting platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region | `ap-south-1` |
| `S3_BUCKET_NAME` | S3 bucket name | `yt-sprint-data` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `S3_ENDPOINT` | Custom S3 endpoint | None (uses AWS) |
| `FLASK_ENV` | Flask environment | `production` |

---

## How to Set Environment Variables

### Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter variable name and value
6. Select environments (Production, Preview, Development)
7. Click **Save**
8. **Redeploy** to apply changes

### Railway
```bash
railway variables set VITE_API_URL=https://your-backend.com/api
```

Or use Railway dashboard:
1. Open your project
2. Go to **Variables** tab
3. Click **New Variable**
4. Add variables
5. Railway auto-redeploys

### Heroku
```bash
heroku config:set AWS_ACCESS_KEY_ID=your_key -a your-app-name
```

Or use Heroku dashboard:
1. Open your app
2. Go to **Settings**
3. Click **Reveal Config Vars**
4. Add variables

---

## Troubleshooting

### Frontend: "Failed to load verticals/exams/subjects"
**Cause**: `VITE_API_URL` not set or backend not accessible

**Fix**:
1. Check `VITE_API_URL` is set in Vercel
2. Test backend: `curl YOUR_BACKEND_URL/api/options -H "X-User-Email: test@adda247.com"`
3. Ensure backend is deployed and running
4. Redeploy Vercel after setting env var

### Backend: S3 connection errors
**Cause**: AWS credentials not set or incorrect

**Fix**:
1. Verify all AWS env vars are set
2. Check IAM user has S3 permissions
3. Test with AWS CLI: `aws s3 ls s3://your-bucket-name`

### Backend: "Invalid email domain"
**Cause**: Email validation in backend requires specific domains

**Fix**: Use email ending with @adda247.com, @addaeducation.com, or @studyiq.com

