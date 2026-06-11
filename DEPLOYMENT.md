# MineLog - Complete Deployment Guide

## 📦 Project Structure

```
Minelog-/
├── public/                  # Frontend (GitHub Pages)
│   ├── index.html          # Worker app
│   └── supervisor.html     # Supervisor dashboard
├── backend/                # Backend (Node.js/Express)
│   ├── server.js           # API server
│   ├── package.json        # Dependencies
│   ├── Dockerfile          # Docker configuration
│   └── README.md           # Backend setup guide
├── workflows/
│   └── deploy.yml          # GitHub Actions (frontend auto-deploy)
├── .gitignore
└── README.md               # Main documentation
```

## 🚀 Deployment Options

### Option 1: GitHub Pages + Local Backend (Simplest for Testing)

**Frontend:**
1. Settings → Pages → Deploy from branch: `main`, folder: `/public`
2. Apps available at:
   - `https://Dave1kimi.github.io/Minelog-/`
   - `https://Dave1kimi.github.io/Minelog-/supervisor.html`

**Backend:**
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3000
```

Update API endpoint in `public/index.html` and `public/supervisor.html`:
```javascript
const API = 'http://localhost:3000/api';
```

---

### Option 2: Full Cloud Deployment (Recommended)

#### Frontend: Vercel

1. Go to https://vercel.com
2. Import your GitHub repo
3. Settings:
   - Root Directory: `public`
   - Build Command: (none - static files)
   - Output Directory: (none)
4. Deploy

**URL:** `https://minelog.vercel.app/`

#### Backend: Heroku or Render

**Option 2a: Heroku**

```bash
# Install Heroku CLI
brew install heroku
heroku login

# Create app
heroku create minelog-backend

# Set environment
heroku config:set NODE_ENV=production

# Deploy (from repository root)
git subtree push --prefix backend heroku main

# Verify
heroku logs --tail
```

**Backend URL:** `https://minelog-backend.herokuapp.com`

**Option 2b: Render.com**

1. Go to https://render.com
2. Create new **Web Service**
3. Connect GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Deploy

**Backend URL:** `https://minelog-backend.onrender.com`

---

### Option 3: Docker + AWS/GCP (Production)

#### Build and push Docker image

```bash
# Build image
docker build -t minelog-backend:latest backend/

# Tag for Docker Hub
docker tag minelog-backend:latest your-dockerhub-username/minelog-backend:latest

# Push to Docker Hub
docker login
docker push your-dockerhub-username/minelog-backend:latest
```

#### Deploy to AWS ECS

1. Create ECR repository
2. Push Docker image
3. Create ECS service
4. Configure load balancer

#### Deploy to Google Cloud Run

```bash
# Deploy directly
gcloud run deploy minelog-backend \
  --source backend/ \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🔗 Connecting Frontend to Backend

After deploying backend, update the API endpoint in both HTML files:

**public/index.html** (line ~179):
```javascript
const API = 'https://your-backend-url.com/api';
```

**public/supervisor.html** (line ~117):
```javascript
const API = 'https://your-backend-url.com/api';
```

Then redeploy frontend.

---

## 📊 Deployment Matrix

| Component | Option 1 | Option 2 | Option 3 |
|-----------|----------|----------|----------|
| **Frontend** | GitHub Pages | Vercel | AWS/GCP |
| **Backend** | Local | Heroku/Render | Docker/ECS/Cloud Run |
| **Database** | SQLite (in-memory) | SQLite (ephemeral) | PostgreSQL/MongoDB |
| **Cost** | Free | Free/Paid | Paid |
| **Persistence** | No | No | Yes |
| **Production Ready** | ❌ | ⚠️ | ✅ |

---

## 🔐 Production Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Set up CORS whitelist
- [ ] Add request authentication
- [ ] Validate all inputs server-side
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add request logging/monitoring
- [ ] Use persistent database (PostgreSQL)
- [ ] Enable database backups
- [ ] Configure firewall rules
- [ ] Set up CDN for static content
- [ ] Add monitoring and alerting

---

## 🧪 Testing After Deployment

### Test Frontend

1. Open worker app: `https://your-frontend-url/`
2. Login with badge: `1234`
3. Test clock in/out
4. Test activity logging
5. Check sync status

### Test Backend

```bash
# Health check
curl https://your-backend-url/health

# Get worker
curl https://your-backend-url/api/workers/1234

# Get supervisor stats
curl https://your-backend-url/api/supervisor/live
```

---

## 📱 Mobile Testing

1. Access frontend on mobile browser
2. Test badge input with physical device or simulator
3. Test offline functionality
4. Check responsive design
5. Test touch interactions

---

## 🆘 Troubleshooting Deployment

### Frontend not loading
- Check GitHub Pages is enabled
- Verify files in `/public` folder
- Check browser console for CORS errors

### Backend API not responding
- Verify backend is deployed and running
- Check API endpoint URL in frontend code
- Verify CORS headers are set
- Check firewall/network rules

### Data not persisting
- Use persistent database (not in-memory SQLite)
- Check database connection string
- Verify backup strategy

### CORS errors
- Update backend CORS configuration
- Add frontend URL to whitelist
- Verify API endpoint includes `/api` path

---

## 🚀 CI/CD Pipeline

GitHub Actions automatically deploys frontend on push:

**Frontend:** Automatic via `.github/workflows/deploy.yml`

**Backend:** Manual or set up additional workflow:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: minelog-backend
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
          appdir: backend
```

---

## 📈 Monitoring

### Frontend Monitoring
- Use Vercel Analytics
- Monitor browser console errors
- Track user interactions

### Backend Monitoring
- Use Heroku/Render logs
- Set up error tracking (Sentry)
- Monitor API response times
- Track database queries

---

## 🔄 Update & Maintenance

### Update Frontend
```bash
git add public/
git commit -m "Update frontend"
git push origin main
# Automatically deploys via GitHub Actions
```

### Update Backend
```bash
git add backend/
git commit -m "Update backend"
git push origin main
# Manually deploy or via CI/CD
```

---

## 📝 Next Steps

1. Choose deployment option that fits your needs
2. Follow option-specific setup steps
3. Test thoroughly in staging environment
4. Monitor after deployment
5. Set up automated backups
6. Plan for scalability

---

**Need help?** Check individual README files:
- `README.md` - Project overview
- `backend/README.md` - Backend setup
