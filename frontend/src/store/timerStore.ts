import { create } from 'zustand';
import type { TimerState } from '../types';

interface TimerStore extends TimerState {
  start: (totalSeconds: number, mode: 'work' | 'break') => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  tick: () => void;
  completeSession: () => void;
}

export const useTimerStore = create<TimerStore>()((set, get) => ({
  isRunning: false,
  isPaused: false,
  timeLeft: 25 * 60,
  totalTime: 25 * 60,
  mode: 'work',
  sessionsCompleted: 0,
  startedAt: null,
  pausedAt: null,
  accumulatedPause: 0,

  start: (totalSeconds, mode) => {
    set({
      isRunning: true,
      isPaused: false,
      timeLeft: totalSeconds,
      totalTime: totalSeconds,
      mode,
      startedAt: Date.now(),
      pausedAt: null,
      accumulatedPause: 0,
    });
  },

  pause: () => {
    set({ isPaused: true, isRunning: false, pausedAt: Date.now() });
  },

  resume: () => {
    const { pausedAt, accumulatedPause } = get();
    const additionalPause = pausedAt ? Date.now() - pausedAt : 0;
    set({
      isPaused: false,
      isRunning: true,
      pausedAt: null,
      accumulatedPause: accumulatedPause + additionalPause,
    });
  },

  reset: () => {
    set({
      isRunning: false,
      isPaused: false,
      timeLeft: get().totalTime,
      startedAt: null,
      pausedAt: null,
      accumulatedPause: 0,
    });
  },

  tick: () => {
    const { startedAt, accumulatedPause, totalTime } = get();
    if (!startedAt) return;
    const elapsed = Date.now() - startedAt - accumulatedPause;
    const remaining = Math.max(0, totalTime - Math.floor(elapsed / 1000));
    set({ timeLeft: remaining });
  },

  completeSession: () => {
    const { mode, sessionsCompleted } = get();
    if (mode === 'work') {
      set({
        sessionsCompleted: sessionsCompleted + 1,
        isRunning: false,
        startedAt: null,
        pausedAt: null,
        accumulatedPause: 0,
      });
    } else {
      set({
        isRunning: false,
        startedAt: null,
        pausedAt: null,
        accumulatedPause: 0,
      });
    }
  },
}));
