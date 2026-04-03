const API_BASE = '/api';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncState {
  days: Record<string, unknown>;
  settings?: unknown;
  scheduleVersion?: number;
}

export async function checkOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncMerge(localState: SyncState): Promise<SyncState | null> {
  try {
    const res = await fetch(`${API_BASE}/sync/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localState),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function syncPull(): Promise<SyncState | null> {
  try {
    const res = await fetch(`${API_BASE}/sync/pull`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
