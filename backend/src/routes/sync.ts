import { Router, type Request, type Response } from 'express';
import { readState, writeState, mergeStates } from '../services/syncService.js';

export const syncRouter = Router();

// Pull: client fetches the latest server state
syncRouter.get('/pull', (_req: Request, res: Response) => {
  try {
    const state = readState();
    res.json(state);
  } catch {
    res.json({ days: {}, settings: null });
  }
});

// Push: client sends its state, server merges
syncRouter.post('/push', (req: Request, res: Response) => {
  try {
    const clientState = req.body;
    if (!clientState || !clientState.days) {
      res.status(400).json({ error: 'Invalid state: missing days' });
      return;
    }
    const serverState = readState();
    const merged = mergeStates(serverState, clientState);
    writeState(merged);
    res.json({ status: 'ok', merged });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Merge: bidirectional — accepts client state, returns merged result
syncRouter.post('/merge', (req: Request, res: Response) => {
  try {
    const clientState = req.body;
    if (!clientState || !clientState.days) {
      res.status(400).json({ error: 'Invalid state: missing days' });
      return;
    }
    const serverState = readState();
    const merged = mergeStates(serverState, clientState);
    writeState(merged);
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: 'Merge failed' });
  }
});
