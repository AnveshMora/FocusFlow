import { useEffect, useRef, useCallback, useState } from 'react';
import { useActivityStore } from '../store/activityStore';
import { checkOnline, syncMerge, syncPull, type SyncStatus } from '../services/syncService';

const SYNC_INTERVAL = 60_000; // 60 seconds
const DEBOUNCE_DELAY = 5_000; // 5 seconds after a change

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>('offline');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSyncingRef = useRef(false);
  const skipNextSubRef = useRef(false);

  const applyMerged = useCallback((merged: { days?: unknown; settings?: unknown; scheduleVersion?: unknown }) => {
    const state = useActivityStore.getState();
    skipNextSubRef.current = true;

    // Take server settings if they're newer, otherwise keep local
    let newSettings = state.settings;
    if (merged.settings) {
      const serverTime = (merged.settings as any).updatedAt ?? 0;
      const localTime = state.settings.updatedAt ?? 0;
      if (serverTime >= localTime) {
        newSettings = merged.settings as typeof state.settings;
      }
    }

    useActivityStore.setState({
      days: (merged.days ?? state.days) as typeof state.days,
      settings: newSettings,
      scheduleVersion: (merged.scheduleVersion as number) ?? state.scheduleVersion,
    });
  }, []);

  const doSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setStatus('syncing');

    try {
      const online = await checkOnline();
      if (!online) {
        setStatus('offline');
        isSyncingRef.current = false;
        return;
      }

      const state = useActivityStore.getState();
      const payload = {
        days: state.days,
        settings: state.settings,
        scheduleVersion: state.scheduleVersion,
      };

      const merged = await syncMerge(payload);
      if (merged && merged.days) {
        applyMerged(merged);
        setStatus('synced');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  }, [applyMerged]);

  // Force pull: overwrite local state with server state (for manual conflict resolution)
  const forcePull = useCallback(async () => {
    isSyncingRef.current = true;
    setStatus('syncing');
    try {
      const pulled = await syncPull();
      if (pulled && pulled.days) {
        applyMerged(pulled);
        setStatus('synced');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  }, [applyMerged]);

  // Periodic sync
  useEffect(() => {
    doSync();
    intervalRef.current = setInterval(doSync, SYNC_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [doSync]);

  // Sync on app focus
  useEffect(() => {
    const handleFocus = () => doSync();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [doSync]);

  // Sync on store changes (debounced) — skip when change came from sync itself
  useEffect(() => {
    const unsub = useActivityStore.subscribe(() => {
      if (skipNextSubRef.current) {
        skipNextSubRef.current = false;
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(doSync, DEBOUNCE_DELAY);
    });
    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [doSync]);

  return { status, syncNow: doSync, forcePull };
}
