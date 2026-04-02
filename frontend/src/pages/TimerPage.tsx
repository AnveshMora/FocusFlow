import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { useTimerStore } from '../store/timerStore';
import { useActivityStore } from '../store/activityStore';
import MeditationPlayer from '../components/MeditationPlayer';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimerPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'pomodoro';
  const customDuration = searchParams.get('duration');

  const timer = useTimerStore();
  const settings = useActivityStore((s) => s.settings);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const workDuration = customDuration
    ? parseInt(customDuration) * 60
    : settings.pomodoroWork * 60;
  const breakDuration = settings.pomodoroBreak * 60;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = setInterval(() => {
        const current = useTimerStore.getState();
        if (current.timeLeft <= 1) {
          current.completeSession();
          clearTimer();
          // Play notification sound
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(
              current.mode === 'work' ? '⏰ Break time!' : '🔥 Back to focus!'
            );
          }
        } else {
          current.tick();
        }
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [timer.isRunning, clearTimer]);

  const handleStart = (timerMode: 'work' | 'break') => {
    const duration = timerMode === 'work' ? workDuration : breakDuration;
    timer.start(duration, timerMode);
  };

  const progress =
    timer.totalTime > 0
      ? ((timer.totalTime - timer.timeLeft) / timer.totalTime) * 100
      : 0;

  const ringRadius = 120;
  const circumference = 2 * Math.PI * ringRadius;
  const offset = circumference - (progress / 100) * circumference;

  const isMeditation = mode === 'meditation';

  return (
    <div className="px-4 py-6 flex flex-col items-center min-h-[calc(100vh-8rem)]">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 justify-center">
          {isMeditation ? (
            <>
              <Brain className="w-6 h-6 text-purple-400" /> Meditation
            </>
          ) : (
            <>
              <Coffee className="w-6 h-6 text-amber-400" /> Pomodoro Timer
            </>
          )}
        </h1>
        {!isMeditation && (
          <p className="text-white/50 text-sm mt-1">
            Session {timer.sessionsCompleted + 1} · {timer.mode === 'work' ? 'Focus' : 'Break'}
          </p>
        )}
      </div>

      {/* Timer Ring */}
      <div className="relative mb-8">
        <svg width={280} height={280} className="-rotate-90">
          <circle
            cx={140}
            cy={140}
            r={ringRadius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={12}
          />
          <circle
            cx={140}
            cy={140}
            r={ringRadius}
            fill="none"
            stroke={
              timer.mode === 'break'
                ? '#22c55e'
                : isMeditation
                ? '#a855f7'
                : '#6366f1'
            }
            strokeWidth={12}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold">
            {formatTime(timer.timeLeft)}
          </span>
          <span className="text-sm text-white/40 mt-1">
            {timer.mode === 'work'
              ? isMeditation
                ? 'Breathe'
                : 'Focus'
              : 'Break'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        {!timer.isRunning && !timer.isPaused ? (
          <button
            onClick={() => handleStart('work')}
            className="w-16 h-16 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors shadow-lg shadow-brand-500/30"
          >
            <Play className="w-7 h-7 ml-0.5" />
          </button>
        ) : (
          <>
            <button
              onClick={timer.reset}
              className="w-12 h-12 rounded-full bg-surface-lighter hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={timer.isRunning ? timer.pause : timer.resume}
              className="w-16 h-16 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors shadow-lg shadow-brand-500/30"
            >
              {timer.isRunning ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 ml-0.5" />
              )}
            </button>
            {!isMeditation && (
              <button
                onClick={() =>
                  handleStart(timer.mode === 'work' ? 'break' : 'work')
                }
                className="w-12 h-12 rounded-full bg-surface-lighter hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Coffee className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Quick presets */}
      {!timer.isRunning && !timer.isPaused && (
        <div className="w-full max-w-xs space-y-3">
          <p className="text-xs text-white/40 text-center uppercase tracking-wider">
            Quick Start
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(isMeditation
              ? [
                  { label: '5 min', secs: 5 * 60 },
                  { label: '10 min', secs: 10 * 60 },
                  { label: '20 min', secs: 20 * 60 },
                ]
              : [
                  { label: '25 / 5', secs: 25 * 60 },
                  { label: '50 / 10', secs: 50 * 60 },
                  { label: '90 / 20', secs: 90 * 60 },
                ]
            ).map((preset) => (
              <button
                key={preset.label}
                onClick={() => timer.start(preset.secs, 'work')}
                className="btn-secondary text-sm text-center"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sessions counter */}
      {!isMeditation && timer.sessionsCompleted > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-white/50">
            🔥 {timer.sessionsCompleted} session{timer.sessionsCompleted > 1 ? 's' : ''}{' '}
            completed today
          </p>
        </div>
      )}

      {/* Meditation guided audio */}
      {isMeditation && (
        <div className="w-full max-w-sm mt-4 card">
          <MeditationPlayer />
        </div>
      )}
    </div>
  );
}
