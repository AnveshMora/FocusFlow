import express from 'express';
import cors from 'cors';
import { syncRouter } from './routes/sync.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Sync routes
app.use('/api/sync', syncRouter);

export default app;
