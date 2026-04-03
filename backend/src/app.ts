import express from 'express';
import cors from 'cors';
import { syncRouter } from './routes/sync.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Request logging for sync debugging
app.use('/api/sync', (req, _res, next) => {
  if (req.method === 'POST' && req.body?.days) {
    const today = req.body.days['2026-04-02'];
    if (today) {
      const acts = today.activities || [];
      const done = acts.filter((a: any) => a.status === 'done').length;
      const ua = req.headers['user-agent'] || 'unknown';
      const device = /mobile|android|iphone/i.test(ua) ? '📱 PHONE' : '💻 LAPTOP';
      console.log(`[SYNC] ${device} → ${req.path} | ${done}/${acts.length} done (${Math.round(done/acts.length*100)}%)`);
    }
  }
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Sync routes
app.use('/api/sync', syncRouter);

export default app;
