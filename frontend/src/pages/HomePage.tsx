import { Flame, Coins } from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import TimelineCard from '../components/TimelineCard';
import CheckpointModal from '../components/CheckpointModal';
import { useActivityStore } from '../store/activityStore';

export default function HomePage() {
  const todayLog = useActivityStore((s) => s.getTodayLog());
  const updateStatus = useActivityStore((s) => s.updateActivityStatus);
  const rewardBalance = useActivityStore((s) => s.getRewardBalance());
  const currency = useActivityStore((s) => s.settings.rewards.currency);

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

  const milestone = 500;
  const progressToMilestone = rewardBalance.balance > 0
    ? ((rewardBalance.balance % milestone) / milestone) * 100
    : 0;
  const isPositive = rewardBalance.balance >= 0;

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

      {/* Reward Card */}
      <div className={`card border ${isPositive ? 'border-green-500/20' : 'border-amber-500/20'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coins className={`w-5 h-5 ${isPositive ? 'text-green-400' : 'text-amber-400'}`} />
            <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Treat Fund
            </span>
          </div>
          <span className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-amber-400'}`}>
            {currency}{rewardBalance.balance}
          </span>
        </div>
        <p className="text-xs text-white/40 mb-3">
          +{currency}{rewardBalance.totalEarned} earned · -{currency}{rewardBalance.totalPenalty} penalties
        </p>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(progressToMilestone, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-white/30 mt-1 text-right">
          Next milestone: {currency}{Math.ceil(rewardBalance.balance / milestone) * milestone || milestone}
        </p>
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
