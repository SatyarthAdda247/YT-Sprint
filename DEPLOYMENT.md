# Deployment Guide

## Production Deployment Checklist

### 1. Security Hardening

#### Backend
- [ ] Replace in-memory `users_db` with PostgreSQL/MongoDB
- [ ] Use environment variables from secure secret manager (AWS Secrets Manager, HashiCorp Vault)
- [ ] Change `JWT_SECRET` to strong random value (e.g., `openssl rand -base64 32`)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for specific frontend domain only
- [ ] Add rate limiting (Flask-Limiter)
- [ ] Add input validation and sanitization
- [ ] Implement virus scanning for uploaded files (ClamAV)
- [ ] Add audit logging
- [ ] Set up monitoring and alerts

#### Frontend
- [ ] Build production bundle: `npm run build`
- [ ] Enable CSP headers
- [ ] Configure environment-specific API URLs
- [ ] Add error tracking (Sentry)

### 2. Database Setup

Replace in-memory storage with persistent database:

#### PostgreSQL Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    vertical VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    subcategory VARCHAR(255),
    subject VARCHAR(255),
    notes TEXT,
    links JSONB DEFAULT '[]',
    files JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    created_by VARCHAR(255) REFERENCES users(email),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_items_vertical ON items(vertical);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_created_by ON items(created_by);
```

### 3. AWS Deployment

#### Option A: Elastic Beanstalk

Backend:
```bash
# Install EB CLI
pip install awsebcli

# Initialize
cd backend
eb init -p python-3.11 content-dashboard

# Create environment
eb create content-dashboard-prod

# Deploy
eb deploy
```

Frontend:
```bash
# Build
cd frontend
npm run build

# Upload to S3 and serve via CloudFront
aws s3 sync dist/ s3://your-frontend-bucket/
```

#### Option B: ECS/Fargate

Create `Dockerfile`:

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

Deploy via ECS task definition.

#### Option C: Lambda + API Gateway

Use Zappa or Chalice for serverless deployment.

### 4. Environment Variables

#### Production .env

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# AWS S3
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-production-bucket

# Security
JWT_SECRET=<generate-strong-random-secret>
SECRET_KEY=<generate-strong-random-secret>

# CORS
ALLOWED_ORIGINS=https://yourdomain.com

# Features
ENABLE_RATE_LIMITING=true
MAX_FILE_SIZE_MB=50
```

### 5. S3 Configuration

#### Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowBackendAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/backend-role"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket/*"
    }
  ]
}
```

#### CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 6. Monitoring & Logging

#### CloudWatch Logs
- Configure log groups for backend
- Set retention policies
- Create alarms for errors

#### Metrics to Track
- API response times
- Error rates
- S3 upload/download volumes
- User signups and logins
- Database query performance

### 7. Backup Strategy

#### Database Backups
- Enable automated daily backups
- Maintain 30-day retention
- Test restore procedures monthly

#### S3 Versioning
- Enable versioning on S3 bucket
- Configure lifecycle policies for old versions
- Use S3 Glacier for long-term archival

### 8. CI/CD Pipeline

#### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to EB
        run: |
          cd backend
          eb deploy production

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy
        run: |
          cd frontend
          npm install
          npm run build
          aws s3 sync dist/ s3://frontend-bucket/
```

### 9. DNS & SSL

1. Register domain or use existing
2. Point A/CNAME records to backend/frontend
3. Use AWS Certificate Manager for SSL
4. Configure CloudFront for frontend with SSL

### 10. Cost Optimization

- Use S3 Intelligent-Tiering for storage
- Enable S3 Transfer Acceleration if needed
- Use Reserved Instances for predictable workloads
- Set up billing alerts

## Testing Production Deployment

```bash
# Test backend health
curl https://api.yourdomain.com/api/options \
  -H "Authorization: Bearer $TOKEN"

# Test file upload
curl -X POST https://api.yourdomain.com/api/item \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test" \
  -F "vertical=Bank" \
  -F "files=@test.pdf"

# Monitor logs
aws logs tail /aws/elasticbeanstalk/app --follow
```

## Rollback Plan

1. Keep previous versions in EB or container registry
2. Use blue-green deployment for zero-downtime
3. Have database migration rollback scripts ready
4. Document rollback steps

## Support & Maintenance

- Schedule regular security updates
- Review and rotate secrets quarterly
- Conduct security audits annually
- Maintain runbook for common issues

