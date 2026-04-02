import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../../data/sync-state.json');

interface Activity {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  status: string;
  instructions?: string;
  notes?: string;
  checklist?: { id: string; label: string; done: boolean }[];
  updatedAt?: number;
}

interface DayLog {
  date: string;
  activities: Activity[];
  completionPercent: number;
  scheduleModified: boolean;
  lastSyncedAt?: number;
}

interface SyncState {
  days: Record<string, DayLog>;
  settings?: Record<string, unknown>;
  scheduleVersion?: number;
}

export function readState(): SyncState {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { days: {} };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { days: {} };
  }
}

export function writeState(state: SyncState): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

/**
 * Merge two states using last-write-wins per activity.
 * For each day, for each activity: the one with the later updatedAt wins.
 */
export function mergeStates(server: SyncState, client: SyncState): SyncState {
  const merged: SyncState = {
    days: { ...server.days },
    settings: client.settings ?? server.settings,
    scheduleVersion: Math.max(
      server.scheduleVersion ?? 0,
      client.scheduleVersion ?? 0
    ),
  };

  for (const [dateKey, clientDay] of Object.entries(client.days)) {
    const serverDay = merged.days[dateKey];

    if (!serverDay) {
      merged.days[dateKey] = { ...clientDay, lastSyncedAt: Date.now() };
      continue;
    }

    const serverActivitiesMap = new Map(
      serverDay.activities.map((a) => [a.id, a])
    );

    const mergedActivities: Activity[] = [];
    const seenIds = new Set<string>();

    for (const clientActivity of clientDay.activities) {
      seenIds.add(clientActivity.id);
      const serverActivity = serverActivitiesMap.get(clientActivity.id);

      if (!serverActivity) {
        mergedActivities.push(clientActivity);
      } else {
        const clientTime = clientActivity.updatedAt ?? 0;
        const serverTime = serverActivity.updatedAt ?? 0;
        mergedActivities.push(clientTime >= serverTime ? clientActivity : serverActivity);
      }
    }

    for (const serverActivity of serverDay.activities) {
      if (!seenIds.has(serverActivity.id)) {
        mergedActivities.push(serverActivity);
      }
    }

    mergedActivities.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const done = mergedActivities.filter((a) => a.status === 'done').length;
    const completionPercent = mergedActivities.length > 0
      ? Math.round((done / mergedActivities.length) * 100)
      : 0;

    merged.days[dateKey] = {
      date: dateKey,
      activities: mergedActivities,
      completionPercent,
      scheduleModified: serverDay.scheduleModified || clientDay.scheduleModified,
      lastSyncedAt: Date.now(),
    };
  }

  return merged;
}
