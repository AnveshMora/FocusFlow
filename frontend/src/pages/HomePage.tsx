import { Flame } from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import TimelineCard from '../components/TimelineCard';
import CheckpointModal from '../components/CheckpointModal';
import { useActivityStore } from '../store/activityStore';

export default function HomePage() {
  const todayLog = useActivityStore((s) => s.getTodayLog());
  const updateStatus = useActivityStore((s) => s.updateActivityStatus);

  // Compute streak from past days
  const days = useActivityStore((s) => s.days);
  const sortedDays = Object.values(days).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  let streak = 0;
  for (const day of sortedDays) {
    if (day.completionPercent >= 50) streak++;
    else break;
  }
  // Count today if partially complete
  if (todayLog.completionPercent > 0 && streak === 0) streak = 1;

  const handleToggle = (activityId: string, currentStatus: string) => {
    if (currentStatus === 'done') {
      updateStatus(activityId, 'pending');
    } else {
      updateStatus(activityId, 'done');
    }
  };

  return (
    <div className="px-4 py-4 space-y-6">
      <CheckpointModal />

      {/* Hero Section */}
      <div className="card flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-400">
            <Flame className="w-5 h-5" />
            <span className="font-bold text-xl">{streak} day streak</span>
          </div>
          <p className="text-white/50 text-sm">
            {todayLog.activities.filter((a) => a.status === 'done').length} of{' '}
            {todayLog.activities.length} activities done
          </p>
        </div>
        <ProgressRing percent={todayLog.completionPercent} size={100} strokeWidth={8} />
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
          Today's Routine
        </h2>
        <div className="space-y-2">
          {todayLog.activities.map((activity) => (
            <TimelineCard
              key={activity.id}
              activity={activity}
              onToggleDone={() => handleToggle(activity.id, activity.status)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
