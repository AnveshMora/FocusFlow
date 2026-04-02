import { useState, useEffect, useRef } from 'react';
import { useActivityStore } from '../store/activityStore';

export default function CheckpointModal() {
  const [visible, setVisible] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const todayLog = useActivityStore((s) => s.getTodayLog());
  const updateStatus = useActivityStore((s) => s.updateActivityStatus);
  const settings = useActivityStore((s) => s.settings);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const active = todayLog.activities.find(
        (a) =>
          a.status === 'active' &&
          a.startTime <= currentTime &&
          a.endTime >= currentTime
      );

      if (active) {
        setCurrentActivity(active.id);
        setVisible(true);
      }
    }, settings.checkpointInterval * 60 * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [todayLog.activities, settings.checkpointInterval]);

  if (!visible || !currentActivity) return null;

  const activity = todayLog.activities.find((a) => a.id === currentActivity);
  if (!activity) return null;

  const handleResponse = (response: 'yes' | 'pause' | 'skip') => {
    if (response === 'skip') {
      updateStatus(currentActivity, 'skipped');
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm text-center space-y-4">
        <div className="text-4xl">🔔</div>
        <h3 className="text-lg font-bold">Checkpoint</h3>
        <p className="text-white/60">
          Are you still doing <span className="text-brand-400 font-medium">{activity.title}</span>?
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleResponse('yes')}
            className="btn-primary flex items-center gap-1"
          >
            ✅ Yes
          </button>
          <button
            onClick={() => handleResponse('pause')}
            className="btn-secondary flex items-center gap-1"
          >
            ⏸ Pause
          </button>
          <button
            onClick={() => handleResponse('skip')}
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-1"
          >
            ❌ Skip
          </button>
        </div>
      </div>
    </div>
  );
}
