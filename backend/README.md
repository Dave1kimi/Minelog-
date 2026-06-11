# MineLog Backend - Setup & Deployment

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

3. **Run development server:**
```bash
npm run dev
```

The backend will start at `http://localhost:3000`

### Test the API

```bash
# Health check
curl http://localhost:3000/health

# Get worker (uses test data: 1234 or 5678)
curl http://localhost:3000/api/workers/1234

# Get live stats
curl http://localhost:3000/api/supervisor/live
```

## 🗄️ Database

Currently uses **SQLite (in-memory)** for easy development. For production, upgrade to:
- PostgreSQL (recommended)
- MySQL
- MongoDB

## 🔌 API Endpoints

### Worker Authentication
```
GET /api/workers/:badge_id
```
Returns worker info or 404

### Shift Management
```
POST /api/shifts/clock-in
  body: { worker_id, timestamp }
  returns: { shift_id, worker_id }

POST /api/shifts/clock-out
  body: { worker_id, shift_id, timestamp }

GET /api/shifts/active/:worker_id
  returns: shift object or null
```

### Tasks
```
POST /api/tasks
  body: { shift_id, worker_id, activity, equipment, notes, start_time, end_time, duration_seconds, sync_id }

GET /api/tasks/shift/:shift_id
  returns: array of tasks
```

### Sync (Offline Support)
```
POST /api/sync
  body: { worker_id, items: [{type, data, local_id}, ...] }
  returns: { results: [{local_id, status, ...}, ...] }
```

### Supervisor
```
GET /api/supervisor/workers
  returns: array of worker statuses

GET /api/supervisor/live
  returns: { active_workers, total_workers, total_active_seconds }

GET /api/supervisor/shift/:worker_id
  returns: shift details with tasks and efficiency

POST /api/supervisor/force-clockout
  body: { worker_id }
```

## 🐳 Docker Deployment

### Build Docker image
```bash
docker build -t minelog-backend .
```

### Run container
```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  minelog-backend
```

## 🚢 Deploy to Heroku

1. **Install Heroku CLI:**
```bash
brew install heroku
heroku login
```

2. **Create Heroku app:**
```bash
heroku create minelog-backend
```

3. **Push to Heroku:**
```bash
git subtree push --prefix backend heroku main
```

4. **Set environment variables:**
```bash
heroku config:set PORT=3000 NODE_ENV=production
```

5. **View logs:**
```bash
heroku logs --tail
```

## 🌐 Deploy to Render

1. Connect GitHub repo to Render
2. Create new **Web Service**
3. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`
4. Deploy

## 🚀 Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

Select `backend` folder as project root

## 📋 Environment Variables

```
PORT=3000                    # Server port
NODE_ENV=development         # Environment
DATABASE_URL=minelog.db      # Database file (SQLite)
```

## 🔐 Security Notes

- Add authentication/authorization for production
- Use HTTPS only
- Implement rate limiting
- Validate all inputs
- Use environment variables for secrets
- Add CORS restrictions
- Implement request logging

## 🧪 Testing

```bash
npm test
```

## 📊 Database Schema

### workers
- id (INT, PRIMARY KEY)
- badge_id (TEXT, UNIQUE)
- name (TEXT)
- created_at (DATETIME)

### shifts
- id (INT, PRIMARY KEY)
- worker_id (INT, FOREIGN KEY)
- clock_in (DATETIME)
- clock_out (DATETIME, NULL)
- created_at (DATETIME)

### tasks
- id (INT, PRIMARY KEY)
- shift_id (INT, FOREIGN KEY)
- worker_id (INT, FOREIGN KEY)
- activity (TEXT)
- equipment (TEXT)
- notes (TEXT)
- start_time (DATETIME)
- end_time (DATETIME)
- duration_seconds (INT)
- sync_id (TEXT, UNIQUE)
- created_at (DATETIME)

### sync_queue
- id (INT, PRIMARY KEY)
- worker_id (INT, FOREIGN KEY)
- item_type (TEXT)
- data (TEXT)
- status (TEXT)
- local_id (TEXT)
- created_at (DATETIME)

## 🚀 Production Checklist

- [ ] Use persistent database (not in-memory)
- [ ] Enable CORS for your frontend domain
- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Set up monitoring/logging
- [ ] Use HTTPS/SSL
- [ ] Backup database regularly
- [ ] Add request validation
- [ ] Implement error handling
- [ ] Set up health checks
- [ ] Configure auto-restart
- [ ] Use reverse proxy (nginx)

## 🆘 Troubleshooting

### Port already in use
```bash
lsof -i :3000
kill -9 <PID>
```

### Database locked
SQLite in-memory doesn't persist. Switch to PostgreSQL for production.

### CORS errors
Add your frontend URL to CORS whitelist in `server.js`

### Connection refused
Verify backend is running on correct port and frontend points to correct API URL

## 📝 Notes

- Test data available with badges: `1234` (John Doe), `5678` (Jane Smith)
- All timestamps use ISO 8601 format
- Efficiency calculated as productive time / total shift time
- Productive activities: all except "Delay" and "Safety"
