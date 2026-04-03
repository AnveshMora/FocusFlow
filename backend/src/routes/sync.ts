import { Router, type Request, type Response } from 'express';
import { readState, writeState, mergeStates } from '../services/syncService.js';

export const syncRouter = Router();

// Simple mutex to prevent concurrent read-modify-write races
let mergeLock: Promise<void> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = mergeLock;
  let resolve: () => void;
  mergeLock = new Promise((r) => { resolve = r; });
  return prev.then(fn).finally(() => resolve!());
}

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
  withLock(async () => {
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
});

// Merge: bidirectional — accepts client state, returns merged result
syncRouter.post('/merge', (req: Request, res: Response) => {
  withLock(async () => {
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
});
