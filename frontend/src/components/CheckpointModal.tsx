import { useState, useEffect, useRef, useCallback } from 'react';
import { useActivityStore } from '../store/activityStore';

// --- Checkpoint tracking (per-activity, non-persisted) ---

interface CheckpointTracker {
  checkCount: number;
  lastCheckTime: number;
  responses: ('yes' | 'pause' | 'skip' | 'ignored')[];
  paused: boolean;
}

const MAX_CHECKS = 5;
const POLL_MS = 60_000;

function getOrCreateTracker(
  trackers: Map<string, CheckpointTracker>,
  id: string
): CheckpointTracker {
  let t = trackers.get(id);
  if (!t) {
    t = { checkCount: 0, lastCheckTime: 0, responses: [], paused: false };
    trackers.set(id, t);
  }
  return t;
}

/**
 * Adaptive escalation:
 *  - 1st check: full interval (default 20 min)
 *  - After 1 ignore: 50% of interval
 *  - After 2+ ignores or paused: 5 min
 */
function getIntervalMs(baseMin: number, checkCount: number, paused: boolean): number {
  if (paused) return 5 * 60_000;
  if (checkCount === 0) return baseMin * 60_000;
  if (checkCount === 1) return Math.round(baseMin * 0.5) * 60_000;
  return 5 * 60_000;
}

function nowTimeStr(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// --- Sound & Vibration ---

function playChime(): void {
  try {
    const Ctx: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    // Gentle ascending major triad: C5 → E5 → G5
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.15;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // Audio unavailable
  }
}

function triggerVibration(): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  } catch {
    // Vibration unavailable
  }
}

// --- Component ---

export default function CheckpointModal() {
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackersRef = useRef(new Map<string, CheckpointTracker>());
  const visibleRef = useRef(false);
  const activeIdRef = useRef<string | null>(null);

  const todayLog = useActivityStore((s) => s.getTodayLog());
  const updateStatus = useActivityStore((s) => s.updateActivityStatus);
  const settings = useActivityStore((s) => s.settings);

  // Keep refs in sync for use inside setTimeout callbacks
  visibleRef.current = visible;
  activeIdRef.current = activeId;

  const activitiesRef = useRef(todayLog.activities);
  const settingsRef = useRef(settings);
  const updateStatusRef = useRef(updateStatus);
  activitiesRef.current = todayLog.activities;
  settingsRef.current = settings;
  updateStatusRef.current = updateStatus;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNextCheck = useCallback(() => {
    clearTimer();

    const fireCheckpoint = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const activities = activitiesRef.current;
      const s = settingsRef.current;
      const time = nowTimeStr();
      const trackers = trackersRef.current;

      // Find the current in-window activity (active or pending)
      const active = activities.find(
        (a) =>
          (a.status === 'active' || a.status === 'pending') &&
          a.startTime <= time &&
          a.endTime >= time
      );

      if (!active) {
        timerRef.current = setTimeout(fireCheckpoint, POLL_MS);
        return;
      }

      const tracker = getOrCreateTracker(trackers, active.id);

      // Auto-skip after max checks
      if (tracker.checkCount >= MAX_CHECKS) {
        updateStatusRef.current(active.id, 'skipped');
        trackers.delete(active.id);
        if (visibleRef.current) {
          setVisible(false);
          setActiveId(null);
        }
        timerRef.current = setTimeout(fireCheckpoint, POLL_MS);
        return;
      }

      // Modal already showing for this activity → user ignored the check
      if (visibleRef.current && activeIdRef.current === active.id) {
        tracker.responses.push('ignored');
        tracker.checkCount++;
        if (tracker.checkCount >= MAX_CHECKS) {
          updateStatusRef.current(active.id, 'skipped');
          trackers.delete(active.id);
          setVisible(false);
          setActiveId(null);
          timerRef.current = setTimeout(fireCheckpoint, POLL_MS);
          return;
        }
      }

      // Modal was showing for a different activity → dismiss & mark old ignored
      if (
        visibleRef.current &&
        activeIdRef.current &&
        activeIdRef.current !== active.id
      ) {
        const old = getOrCreateTracker(trackers, activeIdRef.current);
        old.responses.push('ignored');
        old.checkCount++;
      }

      // Show checkpoint
      tracker.lastCheckTime = Date.now();
      setActiveId(active.id);
      setVisible(true);

      if (s.soundEnabled) playChime();
      if (s.vibrationEnabled) triggerVibration();

      // Schedule escalated follow-up (checkCount+1 assumes this one is ignored)
      const next = getIntervalMs(
        s.checkpointInterval,
        tracker.checkCount + 1,
        tracker.paused
      );
      timerRef.current = setTimeout(fireCheckpoint, next);
    };

    // --- Compute initial delay ---
    const activities = activitiesRef.current;
    const s = settingsRef.current;
    const time = nowTimeStr();

    const active = activities.find(
      (a) =>
        (a.status === 'active' || a.status === 'pending') &&
        a.startTime <= time &&
        a.endTime >= time
    );

    if (!active) {
      timerRef.current = setTimeout(fireCheckpoint, POLL_MS);
      return;
    }

    const tracker = getOrCreateTracker(trackersRef.current, active.id);

    if (tracker.lastCheckTime === 0) {
      // First encounter — wait the full interval before first check
      tracker.lastCheckTime = Date.now();
      const interval = getIntervalMs(s.checkpointInterval, tracker.checkCount, tracker.paused);
      timerRef.current = setTimeout(fireCheckpoint, interval);
    } else {
      // Resuming after a user response — compute remaining time
      const interval = getIntervalMs(s.checkpointInterval, tracker.checkCount, tracker.paused);
      const elapsed = Date.now() - tracker.lastCheckTime;
      const remaining = Math.max(1000, interval - elapsed);
      timerRef.current = setTimeout(fireCheckpoint, remaining);
    }
  }, [clearTimer]);

  useEffect(() => {
    scheduleNextCheck();
    return clearTimer;
  }, [scheduleNextCheck, clearTimer]);

  // Clean up trackers for activities that are no longer active/pending
  useEffect(() => {
    for (const [id] of trackersRef.current) {
      const a = todayLog.activities.find((act) => act.id === id);
      if (!a || (a.status !== 'active' && a.status !== 'pending')) {
        trackersRef.current.delete(id);
      }
    }
  }, [todayLog.activities]);

  // --- Render ---

  if (!visible || !activeId) return null;

  const activity = todayLog.activities.find((a) => a.id === activeId);
  if (!activity) return null;

  const tracker = getOrCreateTracker(trackersRef.current, activeId);

  const handleResponse = (response: 'yes' | 'pause' | 'skip') => {
    tracker.responses.push(response);
    tracker.lastCheckTime = Date.now();

    switch (response) {
      case 'yes':
        // Reset escalation — user is engaged
        tracker.checkCount = 0;
        tracker.paused = false;
        if (activity.status === 'pending') {
          updateStatus(activeId, 'active');
        }
        break;
      case 'pause':
        // Next check in 5 min
        tracker.checkCount++;
        tracker.paused = true;
        break;
      case 'skip':
        updateStatus(activeId, 'skipped');
        trackersRef.current.delete(activeId);
        break;
    }

    setVisible(false);
    setActiveId(null);
    clearTimer();
    // Small delay for 'skip' so the store update propagates before rescheduling
    timerRef.current = setTimeout(
      () => scheduleNextCheck(),
      response === 'skip' ? 200 : 0
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm text-center space-y-4">
        <div className="text-4xl">🔔</div>
        <h3 className="text-lg font-bold">Checkpoint</h3>
        <p className="text-white/60">
          Are you still doing{' '}
          <span className="text-brand-400 font-medium">{activity.title}</span>?
        </p>
        <p className="text-white/30 text-xs">
          Check {Math.min(tracker.checkCount + 1, MAX_CHECKS)} of {MAX_CHECKS}
          {tracker.paused && ' · ⏸ Paused'}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleResponse('yes')}
            className="btn-primary flex items-center gap-1"
          >
            ✅ Yes, I&apos;m on it
          </button>
          <button
            onClick={() => handleResponse('pause')}
            className="btn-secondary flex items-center gap-1"
          >
            ⏸ Pause
          </button>
          <button
            onClick={() => handleResponse('skip')}
            className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-1"
          >
            ❌ Skip
          </button>
        </div>
      </div>
    </div>
  );
}
