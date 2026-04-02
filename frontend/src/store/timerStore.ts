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

  start: (totalSeconds, mode) => {
    set({
      isRunning: true,
      isPaused: false,
      timeLeft: totalSeconds,
      totalTime: totalSeconds,
      mode,
    });
  },

  pause: () => {
    set({ isPaused: true, isRunning: false });
  },

  resume: () => {
    set({ isPaused: false, isRunning: true });
  },

  reset: () => {
    set({
      isRunning: false,
      isPaused: false,
      timeLeft: get().totalTime,
    });
  },

  tick: () => {
    const { timeLeft } = get();
    if (timeLeft <= 0) return;
    set({ timeLeft: timeLeft - 1 });
  },

  completeSession: () => {
    const { mode, sessionsCompleted } = get();
    if (mode === 'work') {
      set({ sessionsCompleted: sessionsCompleted + 1, isRunning: false });
    } else {
      set({ isRunning: false });
    }
  },
}));
