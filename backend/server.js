require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('SQLite database initialized (in-memory)');
});

// Initialize database schema
const initDB = () => {
  db.serialize(() => {
    // Workers table
    db.run(`
      CREATE TABLE IF NOT EXISTS workers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        badge_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Shifts table
    db.run(`
      CREATE TABLE IF NOT EXISTS shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        worker_id INTEGER NOT NULL,
        clock_in DATETIME NOT NULL,
        clock_out DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(worker_id) REFERENCES workers(id)
      )
    `);

    // Tasks table
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shift_id INTEGER NOT NULL,
        worker_id INTEGER NOT NULL,
        activity TEXT NOT NULL,
        equipment TEXT,
        notes TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        duration_seconds INTEGER NOT NULL,
        sync_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(shift_id) REFERENCES shifts(id),
        FOREIGN KEY(worker_id) REFERENCES workers(id)
      )
    `);

    // Sync queue table
    db.run(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        worker_id INTEGER NOT NULL,
        item_type TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        local_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(worker_id) REFERENCES workers(id)
      )
    `);

    // Seed test data
    db.run("INSERT OR IGNORE INTO workers (badge_id, name) VALUES ('1234', 'John Doe')");
    db.run("INSERT OR IGNORE INTO workers (badge_id, name) VALUES ('5678', 'Jane Smith')");
  });
};

initDB();

// Helper functions
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// ============ WORKER ENDPOINTS ============

// GET /api/workers/:badge_id - Authenticate worker
app.get('/api/workers/:badge_id', async (req, res) => {
  try {
    const worker = await dbGet('SELECT * FROM workers WHERE badge_id = ?', [req.params.badge_id]);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SHIFT ENDPOINTS ============

// POST /api/shifts/clock-in
app.post('/api/shifts/clock-in', async (req, res) => {
  try {
    const { worker_id, timestamp } = req.body;
    
    // Check for active shift
    const activeShift = await dbGet(
      'SELECT * FROM shifts WHERE worker_id = ? AND clock_out IS NULL',
      [worker_id]
    );
    if (activeShift) return res.status(409).json({ error: 'Worker already clocked in' });

    const result = await dbRun(
      'INSERT INTO shifts (worker_id, clock_in) VALUES (?, ?)',
      [worker_id, timestamp || new Date().toISOString()]
    );

    res.json({ shift_id: result.id, worker_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shifts/clock-out
app.post('/api/shifts/clock-out', async (req, res) => {
  try {
    const { worker_id, shift_id, timestamp } = req.body;

    await dbRun(
      'UPDATE shifts SET clock_out = ? WHERE id = ? AND worker_id = ?',
      [timestamp || new Date().toISOString(), shift_id, worker_id]
    );

    const shift = await dbGet('SELECT * FROM shifts WHERE id = ?', [shift_id]);
    res.json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shifts/active/:worker_id
app.get('/api/shifts/active/:worker_id', async (req, res) => {
  try {
    const shift = await dbGet(
      'SELECT * FROM shifts WHERE worker_id = ? AND clock_out IS NULL ORDER BY id DESC LIMIT 1',
      [req.params.worker_id]
    );
    res.json(shift || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ TASK ENDPOINTS ============

// POST /api/tasks
app.post('/api/tasks', async (req, res) => {
  try {
    const { shift_id, worker_id, activity, equipment, notes, start_time, end_time, duration_seconds, sync_id } = req.body;

    const result = await dbRun(
      `INSERT INTO tasks (shift_id, worker_id, activity, equipment, notes, start_time, end_time, duration_seconds, sync_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [shift_id, worker_id, activity, equipment, notes, start_time, end_time, duration_seconds, sync_id]
    );

    res.json({ id: result.id, sync_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/shift/:shift_id
app.get('/api/tasks/shift/:shift_id', async (req, res) => {
  try {
    const tasks = await dbAll('SELECT * FROM tasks WHERE shift_id = ? ORDER BY start_time', [req.params.shift_id]);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SYNC ENDPOINT ============

// POST /api/sync
app.post('/api/sync', async (req, res) => {
  try {
    const { worker_id, items } = req.body;
    const results = [];

    for (const item of items) {
      try {
        if (item.type === 'clock_in') {
          const result = await dbRun(
            'INSERT INTO shifts (worker_id, clock_in) VALUES (?, ?)',
            [worker_id, item.data.time]
          );
          results.push({ local_id: item.local_id, status: 'synced', shift_id: result.id });
        } else if (item.type === 'clock_out') {
          await dbRun(
            'UPDATE shifts SET clock_out = ? WHERE id = ? AND worker_id = ?',
            [item.data.time, item.data.shift_id, worker_id]
          );
          results.push({ local_id: item.local_id, status: 'synced' });
        } else if (item.type === 'task') {
          const result = await dbRun(
            `INSERT INTO tasks (shift_id, worker_id, activity, equipment, notes, start_time, end_time, duration_seconds, sync_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [item.data.shift_id, worker_id, item.data.activity, item.data.equipment, item.data.notes,
             item.data.startTime, item.data.endTime, item.data.duration, item.data.id]
          );
          results.push({ local_id: item.local_id, status: 'synced', task_id: result.id });
        }
      } catch (itemErr) {
        results.push({ local_id: item.local_id, status: 'error', error: itemErr.message });
      }
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SUPERVISOR ENDPOINTS ============

// GET /api/supervisor/workers
app.get('/api/supervisor/workers', async (req, res) => {
  try {
    const workers = await dbAll(`
      SELECT 
        w.id, w.badge_id, w.name,
        s.id as shift_id,
        CASE WHEN s.id IS NOT NULL AND s.clock_out IS NULL THEN 1 ELSE 0 END as is_online,
        CASE WHEN s.clock_out IS NULL THEN CAST((strftime('%s', 'now') - strftime('%s', s.clock_in)) / 60 AS INTEGER) ELSE 0 END as shift_duration,
        (SELECT activity FROM tasks WHERE shift_id = s.id ORDER BY start_time DESC LIMIT 1) as current_activity
      FROM workers w
      LEFT JOIN shifts s ON w.id = s.worker_id AND s.clock_out IS NULL
    `);
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supervisor/live
app.get('/api/supervisor/live', async (req, res) => {
  try {
    const stats = await dbGet(`
      SELECT 
        COUNT(DISTINCT CASE WHEN s.clock_out IS NULL THEN s.worker_id END) as active_workers,
        COUNT(DISTINCT w.id) as total_workers,
        COALESCE(SUM(CASE WHEN s.clock_out IS NULL THEN CAST((strftime('%s', 'now') - strftime('%s', s.clock_in)) AS INTEGER) ELSE 0 END), 0) as total_active_seconds
      FROM workers w
      LEFT JOIN shifts s ON w.id = s.worker_id
    `);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supervisor/shift/:worker_id
app.get('/api/supervisor/shift/:worker_id', async (req, res) => {
  try {
    const shift = await dbGet(`
      SELECT 
        s.*, w.name, w.badge_id,
        CAST((strftime('%s', 'now') - strftime('%s', s.clock_in)) AS INTEGER) as shift_duration_seconds
      FROM shifts s
      JOIN workers w ON s.worker_id = w.id
      WHERE s.worker_id = ? AND s.clock_out IS NULL
    `, [req.params.worker_id]);

    if (!shift) return res.json(null);

    const tasks = await dbAll('SELECT * FROM tasks WHERE shift_id = ?', [shift.id]);
    
    const totalProductive = tasks
      .filter(t => !['Delay', 'Safety'].includes(t.activity))
      .reduce((sum, t) => sum + t.duration_seconds, 0);
    
    const efficiency = shift.shift_duration_seconds > 0 
      ? Math.round((totalProductive / shift.shift_duration_seconds) * 100)
      : 0;

    res.json({ ...shift, tasks, efficiency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/supervisor/force-clockout
app.post('/api/supervisor/force-clockout', async (req, res) => {
  try {
    const { worker_id } = req.body;
    
    await dbRun(
      'UPDATE shifts SET clock_out = ? WHERE worker_id = ? AND clock_out IS NULL',
      [new Date().toISOString(), worker_id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`⛏️  MineLog Backend running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
