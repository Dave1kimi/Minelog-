# ⛏️ MineLog - Mining Operation Time Tracking System

A modern, offline-first time tracking application for mining operations with real-time supervisor dashboards and performance analytics.

## 📋 Features

### Worker App (`public/index.html`)
- ✅ **Badge-based Login** - 4-6 digit badge ID entry with numpad
- ✅ **Clock In/Out** - Track shift start/end times
- ✅ **Activity Tracking** - Log activities: Drilling, Hauling, Loading, Maintenance, Safety, Delay
- ✅ **Equipment Logging** - Record which equipment was used
- ✅ **Notes & Comments** - Add notes about issues or delays
- ✅ **Offline Support** - Full functionality without internet connection
- ✅ **Auto-Sync** - Syncs data every 30 seconds when online
- ✅ **Statistics** - Real-time efficiency and productivity metrics
- ✅ **CSV Export** - Download work history

### Supervisor Dashboard (`public/supervisor.html`)
- ✅ **Live Monitoring** - Real-time worker status and activity
- ✅ **Summary Stats** - Workers on shift, total hours, alerts
- ✅ **Status Indicators** - Active, Idle, Off, or Alert states
- ✅ **Shift Details** - View individual worker shift information
- ✅ **Emergency Control** - Force clock-out workers if needed
- ✅ **Idle Detection** - Alert when workers are idle for long periods
- ✅ **Long Shift Warnings** - Highlight shifts exceeding 12 hours

## 🚀 Quick Start

### GitHub Pages Deployment (Free)

1. **Enable GitHub Pages** in your repository:
   - Go to **Settings** → **Pages**
   - Select **Deploy from a branch**
   - Choose branch: `main`
   - Select folder: `/public`
   - Save

2. **Access the apps:**
   - Worker App: `https://Dave1kimi.github.io/Minelog-/`
   - Supervisor: `https://Dave1kimi.github.io/Minelog-/supervisor.html`

### Manual Deployment

Push changes to `main` branch - GitHub Actions automatically deploys to GitHub Pages.

```bash
git add .
git commit -m "Update MineLog apps"
git push origin main
```

## 📁 Project Structure

```
Minelog-/
├── public/
│   ├── index.html           # Worker app
│   └── supervisor.html      # Supervisor dashboard
├── workflows/
│   └── deploy.yml          # GitHub Actions deployment
└── README.md               # This file
```

## 🔌 API Endpoints Required

The apps expect a backend API at `/api` with these endpoints:

### Worker App
- `GET /api/workers/{badge_id}` - Authenticate worker
- `POST /api/shifts/clock-in` - Start shift
- `POST /api/shifts/clock-out` - End shift
- `GET /api/shifts/active/{worker_id}` - Check active shift
- `POST /api/tasks` - Log task
- `GET /api/tasks/shift/{shift_id}` - Get tasks
- `POST /api/sync` - Sync offline data

### Supervisor Dashboard
- `GET /api/supervisor/workers` - List all workers
- `GET /api/supervisor/live` - Live statistics
- `GET /api/supervisor/shift/{worker_id}` - Shift details
- `POST /api/supervisor/force-clockout` - Clock out worker

## 💾 Local Storage

The worker app uses browser `localStorage` to persist:
- Worker profile
- Current shift state
- Task history
- Sync queue (for offline-first capability)

## 🔐 Security Notes

- Badge IDs are stored in localStorage (implement auth in backend)
- API calls should validate worker authentication
- Consider HTTPS for production
- Implement rate limiting on API endpoints
- Add CORS headers for cross-origin requests

## 🛠️ Backend Setup

You'll need to create a backend API. Example structure:

### Technology Stack Options
- **Node.js/Express** - JavaScript backend
- **Python/Flask** - Lightweight Python API
- **Go** - High-performance API
- **PostgreSQL/MongoDB** - Database

### Minimal API Requirements
Each endpoint should return JSON with worker/shift/task data.

## 📊 Data Models

### Worker
```json
{
  "id": 1,
  "badge_id": "1234",
  "name": "John Doe"
}
```

### Shift
```json
{
  "id": 1,
  "worker_id": 1,
  "clock_in": "2026-06-11T08:00:00Z",
  "clock_out": "2026-06-11T16:00:00Z",
  "shift_duration_seconds": 28800
}
```

### Task
```json
{
  "id": 1,
  "shift_id": 1,
  "activity": "Drilling",
  "equipment": "Drill #3",
  "notes": "Completed section B",
  "start_time": "2026-06-11T08:00:00Z",
  "end_time": "2026-06-11T10:30:00Z",
  "duration_seconds": 9000
}
```

## 🔄 Sync Architecture

The worker app implements an offline-first sync strategy:

1. **Local First** - All actions stored in localStorage immediately
2. **Queue** - Changes added to sync queue
3. **Sync** - Every 30 seconds, attempts to sync queued items
4. **Fallback** - If offline, data remains in queue until connection restored
5. **Conflict Resolution** - Server timestamp wins on conflicts

## 🎨 Customization

### Colors
Edit CSS variables in the `<style>` tags:
- Primary: `#f59e0b` (amber)
- Success: `#16a34a` (green)
- Error: `#dc2626` (red)
- Background: `#0f0f0f` (near black)

### Activities
Modify the activity buttons in both apps to match your operations.

### API Endpoint
Change the `API` constant at the top of the script section to point to your backend.

## 📱 Browser Support

- ✅ Chrome/Chromium (desktop & mobile)
- ✅ Safari (iOS & macOS)
- ✅ Firefox
- ✅ Edge

## 🐛 Troubleshooting

### Apps not loading
1. Check GitHub Pages is enabled
2. Verify files are in the `/public` folder
3. Check browser console for errors

### API not responding
1. Verify backend is running
2. Check CORS headers are set
3. Confirm API endpoint URL in code

### Data not syncing
1. Check network connectivity
2. Verify API endpoints are correct
3. Check browser console for errors
4. Inspect localStorage for sync queue

## 📝 Development Notes

### Testing Locally
1. Serve the `public/` folder with a local server:
   ```bash
   python -m http.server 8000
   # or
   npx http-server public
   ```
2. Access at `http://localhost:8000`

### Local API Testing
Point the `API` constant to `http://localhost:3000/api` (or your backend port)

## 🚢 Production Deployment

### Option 1: GitHub Pages (Static Only)
- Free, built-in hosting
- Good for frontend-only testing
- Requires separate backend

### Option 2: Vercel
1. Connect GitHub repo
2. Set root directory to `/public`
3. Deploy

### Option 3: Netlify
1. Connect GitHub repo
2. Set publish directory to `public`
3. Configure redirect rules for single-page app

### Option 4: Docker + Cloud
1. Create Dockerfile for backend
2. Deploy frontend to CDN
3. Deploy backend to Kubernetes or serverless

## 📄 License

MIT - Feel free to use and modify for your mining operations.

## 👨‍💼 Support

For issues, feature requests, or questions:
1. Check troubleshooting section
2. Review API endpoint requirements
3. Inspect browser console for errors
4. Check GitHub Issues

---

**MineLog** - Making mining operations transparent, one shift at a time. ⛏️
