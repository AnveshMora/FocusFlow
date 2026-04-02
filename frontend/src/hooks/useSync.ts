import { useEffect, useRef, useCallback, useState } from 'react';
import { useActivityStore } from '../store/activityStore';
import { checkOnline, syncMerge, type SyncStatus } from '../services/syncService';

const SYNC_INTERVAL = 60_000; // 60 seconds
const DEBOUNCE_DELAY = 5_000; // 5 seconds after a change

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>('offline');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSyncingRef = useRef(false);

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
        // Apply merged state back to local store
        useActivityStore.setState({
          days: merged.days as typeof state.days,
          scheduleVersion: (merged.scheduleVersion as number) ?? state.scheduleVersion,
        });
        setStatus('synced');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Periodic sync
  useEffect(() => {
    // Initial sync on mount
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

  // Sync on store changes (debounced)
  useEffect(() => {
    const unsub = useActivityStore.subscribe(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(doSync, DEBOUNCE_DELAY);
    });
    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [doSync]);

  return { status, syncNow: doSync };
}
