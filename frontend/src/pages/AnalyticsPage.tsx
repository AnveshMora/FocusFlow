import { useMemo } from 'react';
import { Flame, TrendingUp, TrendingDown, Calendar, Coins } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import type { WeeklyData, HeatmapDay } from '../types';

export default function AnalyticsPage() {
  const days = useActivityStore((s) => s.days);
  const todayLog = useActivityStore((s) => s.getTodayLog());
  const rewardBalance = useActivityStore((s) => s.getRewardBalance());
  const { currency, rewardPerDay, penaltyPerMiss } = useActivityStore((s) => s.settings.rewards);

  const { streak, bestStreak, weeklyData, heatmapDays, totalDays, avgCompletion } =
    useMemo(() => {
      const sorted = Object.values(days).sort((a, b) =>
        b.date.localeCompare(a.date)
      );

      // Current streak
      let currentStreak = 0;
      for (const day of sorted) {
        if (day.completionPercent >= 50) currentStreak++;
        else break;
      }
      if (todayLog.completionPercent > 0 && currentStreak === 0)
        currentStreak = 1;

      // Best streak
      let best = 0;
      let tempStreak = 0;
      for (const day of [...sorted].reverse()) {
        if (day.completionPercent >= 50) {
          tempStreak++;
          best = Math.max(best, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Weekly data (last 7 days)
      const weekly: WeeklyData[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const dayLog = days[key];
        weekly.push({
          day: dayNames[d.getDay()],
          completion: dayLog?.completionPercent || 0,
        });
      }

      // Heatmap (last 30 days)
      const heatmap: HeatmapDay[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const dayLog = days[key];
        const pct = dayLog?.completionPercent || 0;
        const level = pct >= 80 ? 4 : pct >= 60 ? 3 : pct >= 30 ? 2 : pct > 0 ? 1 : 0;
        heatmap.push({ date: key, level: level as 0 | 1 | 2 | 3 | 4 });
      }

      const total = sorted.length;
      const avg =
        total > 0
          ? Math.round(
              sorted.reduce((sum, d) => sum + d.completionPercent, 0) / total
            )
          : 0;

      return {
        streak: currentStreak,
        bestStreak: Math.max(best, currentStreak),
        weeklyData: weekly,
        heatmapDays: heatmap,
        totalDays: total,
        avgCompletion: avg,
      };
    }, [days, todayLog]);

  const heatmapColors = [
    'bg-white/5',       // 0 - missed
    'bg-amber-500/30',  // 1 - low (amber = room to improve)
    'bg-yellow-500/40', // 2 - partial
    'bg-green-500/40',  // 3 - good
    'bg-green-500',     // 4 - full
  ];

  const maxBar = Math.max(...weeklyData.map((d) => d.completion), 1);

  return (
    <div className="px-4 py-4 space-y-6">
      <h1 className="text-xl font-bold">Analytics</h1>

      {/* Streak Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <Flame className="w-8 h-8 text-orange-400 mx-auto mb-1" />
          <p className="text-3xl font-bold">{streak}</p>
          <p className="text-xs text-white/50">Current Streak</p>
        </div>
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-1" />
          <p className="text-3xl font-bold">{bestStreak}</p>
          <p className="text-xs text-white/50">Best Streak</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold">{totalDays}</p>
          <p className="text-xs text-white/50">Days Tracked</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold">{avgCompletion}%</p>
          <p className="text-xs text-white/50">Avg Completion</p>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
          This Week
        </h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-white/40">{d.completion}%</span>
              <div className="w-full relative" style={{ height: '100px' }}>
                <div className="absolute bottom-0 w-full bg-white/5 rounded-t" style={{ height: '100%' }} />
                <div
                  className="absolute bottom-0 w-full rounded-t transition-all duration-500"
                  style={{
                    height: `${(d.completion / maxBar) * 100}%`,
                    background:
                      d.completion >= 80
                        ? '#22c55e'
                        : d.completion >= 50
                        ? '#eab308'
                        : d.completion > 0
                        ? '#f97316'
                        : 'transparent',
                  }}
                />
              </div>
              <span className="text-[10px] text-white/50">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Calendar */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-white/50" />
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Last 30 Days
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {heatmapDays.map((d) => (
            <div
              key={d.date}
              className={`aspect-square rounded-sm ${heatmapColors[d.level]}`}
              title={`${d.date}: ${d.level === 0 ? 'No data' : `Level ${d.level}`}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-[10px] text-white/30">Less</span>
          {heatmapColors.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-white/30">More</span>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Rewards
          </h3>
        </div>

        {/* Balance */}
        <div className="text-center mb-4">
          <p className={`text-3xl font-bold ${rewardBalance.balance >= 0 ? 'text-green-400' : 'text-amber-400'}`}>
            {currency}{rewardBalance.balance}
          </p>
          <p className="text-xs text-white/40 mt-1">
            +{currency}{rewardBalance.totalEarned} earned · -{currency}{rewardBalance.totalPenalty} penalties
          </p>
        </div>

        {/* Day counts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-green-500/10 rounded-lg p-2 text-center">
            <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-400">{rewardBalance.goodDays}</p>
            <p className="text-[10px] text-white/40">Good Days</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-2 text-center">
            <TrendingDown className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-400">{rewardBalance.badDays}</p>
            <p className="text-[10px] text-white/40">Bad Days</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <Calendar className="w-4 h-4 text-white/40 mx-auto mb-1" />
            <p className="text-lg font-bold text-white/60">{rewardBalance.neutralDays}</p>
            <p className="text-[10px] text-white/40">Neutral</p>
          </div>
        </div>

        {/* Last 7 days breakdown */}
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
          Last 7 Days
        </h4>
        <div className="space-y-1">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const key = d.toISOString().split('T')[0];
            const dayLog = days[key];
            const pct = dayLog?.completionPercent ?? 0;
            const hasActivities = (dayLog?.activities.length ?? 0) > 0;
            const isToday = i === 6;
            const isGood = pct >= 90;
            const isBad = pct < 50 && hasActivities;
            const reward = isToday ? 0 : isGood ? rewardPerDay : isBad ? -penaltyPerMiss : 0;
            const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div key={key} className="flex items-center justify-between py-1.5 px-2 rounded bg-white/[0.02]">
                <span className="text-xs text-white/50 w-28">{label}</span>
                <span className="text-xs text-white/60 w-12 text-center">{pct}%</span>
                <span className={`text-xs font-medium w-16 text-right ${
                  isToday ? 'text-blue-400' : reward > 0 ? 'text-green-400' : reward < 0 ? 'text-amber-400' : 'text-white/30'
                }`}>
                  {isToday ? 'Today' : reward > 0 ? `+${currency}${reward}` : reward < 0 ? `-${currency}${Math.abs(reward)}` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
