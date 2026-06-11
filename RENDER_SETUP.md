# 🚀 Deploy MineLog Backend to Render

## Step-by-Step Setup

### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub
- Authorize Render to access your repositories

### 2. Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Select your **`Dave1kimi/Minelog-`** repository
3. Click **"Connect"**

### 3. Configure Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `minelog-backend` |
| **Environment** | `Node` |
| **Region** | `Oregon` (or nearest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` (or paid if needed) |

### 4. Add Environment Variables

Click **"Advanced"** and add:

```
PORT = 3000
NODE_ENV = production
```

### 5. Deploy

Click **"Create Web Service"**

✅ Deployment will start automatically!

Monitor progress in the **"Logs"** tab.

---

## 📋 Deployment Status

Once deployed successfully, you'll see:

```
✓ Build successful
✓ Service live at: https://minelog-backend.onrender.com
```

Your backend URL: **`https://minelog-backend.onrender.com`**

---

## 🔗 Connect Frontend to Backend

Now update your frontend to use the new backend URL:

### Edit `public/index.html`

Find this line (around line 179):
```javascript
const API = window.location.origin + '/api';
```

Replace with:
```javascript
const API = 'https://minelog-backend.onrender.com/api';
```

### Edit `public/supervisor.html`

Find this line (around line 117):
```javascript
const API = window.location.origin + '/api';
```

Replace with:
```javascript
const API = 'https://minelog-backend.onrender.com/api';
```

### Commit and Push

```bash
git add public/
git commit -m "Update API endpoint to Render backend"
git push origin main
```

Frontend will auto-deploy via GitHub Actions.

---

## ✅ Test Your Deployment

### 1. Test Backend Health
```bash
curl https://minelog-backend.onrender.com/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-06-11T..."}
```

### 2. Test Worker Authentication
```bash
curl https://minelog-backend.onrender.com/api/workers/1234
```

Expected response:
```json
{"id":1,"badge_id":"1234","name":"John Doe","created_at":"..."}
```

### 3. Test Supervisor Stats
```bash
curl https://minelog-backend.onrender.com/api/supervisor/live
```

Expected response:
```json
{"active_workers":0,"total_workers":2,"total_active_seconds":0}
```

### 4. Test Frontend
1. Open your frontend: `https://Dave1kimi.github.io/Minelog-/`
2. Try logging in with badge `1234`
3. Clock in and create a task
4. Verify data syncs to backend

---

## 🔄 Auto-Deployment

**Good news:** Render automatically redeploys when you push to `main`!

Workflow:
1. Make changes to backend
2. Push to GitHub
3. Render detects changes
4. Auto-builds and deploys
5. Your service is updated

No manual deployment needed! 🎉

---

## 📊 Monitor Your Backend

### View Logs
1. Go to your service dashboard
2. Click **"Logs"** tab
3. See real-time API activity

### View Metrics
1. Click **"Metrics"** tab
2. Monitor CPU, memory, requests

### Restart Service
1. Click **"Manual Deploy"**
2. Select **"Latest Commit"**
3. Click **"Deploy"**

---

## 🆘 Troubleshooting

### Service won't start
- Check logs for errors
- Verify `package.json` has correct scripts
- Ensure `backend/server.js` exists
- Check Node.js version compatibility

### API endpoints returning 404
- Verify `ROOT_DIRECTORY` is set to `backend`
- Check that API URLs point to correct domain
- Test health endpoint first

### Frontend not connecting
- Verify backend URL in frontend code
- Check CORS is working (should be by default)
- Test API endpoints manually with curl
- Check browser console for CORS errors

### Database issues
- Currently using in-memory SQLite (no persistence)
- Data resets when service restarts
- For production: upgrade to PostgreSQL/MongoDB

---

## 💾 Production Upgrades

### Use PostgreSQL

1. Add PostgreSQL in Render dashboard
2. Update `backend/server.js` to use PostgreSQL
3. Set `DATABASE_URL` environment variable
4. Redeploy

### Enable Custom Domain

1. Go to Service Settings
2. Click **"Custom Domain"**
3. Add your domain
4. Follow DNS setup instructions

---

## 💰 Pricing

**Free Plan:**
- 1 web service
- Auto-pause after 15 mins of inactivity
- Good for testing

**Paid Plans:**
- Always-on service
- Custom domains
- Database support
- More resources

---

## 📈 Next Steps

1. ✅ Deploy backend to Render
2. ✅ Update frontend API endpoint
3. ✅ Test both apps end-to-end
4. ✅ Set up monitoring
5. ✅ Plan for production (persistent DB, custom domain)

---

## 🔗 Useful Links

- **Render Dashboard:** https://dashboard.render.com
- **Your Service:** https://dashboard.render.com/web/minelog-backend
- **Documentation:** https://render.com/docs
- **API Health:** https://minelog-backend.onrender.com/health

---

**Congratulations! Your MineLog backend is now live on Render!** 🎉

Your complete system:
- 🎨 **Frontend:** `https://Dave1kimi.github.io/Minelog-/`
- ⚙️ **Backend:** `https://minelog-backend.onrender.com`
- 📊 **API:** `https://minelog-backend.onrender.com/api`
