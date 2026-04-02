import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  SkipForward,
  AlertCircle,
  Dumbbell,
  Brain,
  BookOpen,
  Briefcase,
  Heart,
  Moon,
  Car,
  Zap,
} from 'lucide-react';
import type { Activity } from '../types';

const typeIcons: Record<string, React.ElementType> = {
  workout: Dumbbell,
  meditation: Brain,
  study: BookOpen,
  work: Briefcase,
  recovery: Heart,
  sleep: Moon,
  travel: Car,
  routine: Zap,
  custom: Zap,
};

const statusColors: Record<string, string> = {
  done: 'border-green-500 bg-green-500/10',
  active: 'border-blue-500 bg-blue-500/10',
  pending: 'border-white/10 bg-surface-lighter',
  skipped: 'border-red-500/50 bg-red-500/5',
  missed: 'border-red-500 bg-red-500/10',
};

const statusIcons: Record<string, React.ElementType> = {
  done: CheckCircle2,
  active: Circle,
  pending: Circle,
  skipped: SkipForward,
  missed: AlertCircle,
};

interface TimelineCardProps {
  activity: Activity;
  onToggleDone: () => void;
}

export default function TimelineCard({ activity, onToggleDone }: TimelineCardProps) {
  const navigate = useNavigate();
  const Icon = typeIcons[activity.type] || Zap;
  const StatusIcon = statusIcons[activity.status] || Circle;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${statusColors[activity.status]}`}
    >
      {/* Time column */}
      <div className="flex flex-col items-center min-w-[50px]">
        <span className="text-xs font-mono text-white/50">{activity.startTime}</span>
        <div className="w-px h-4 bg-white/10 my-1" />
        <span className="text-xs font-mono text-white/30">{activity.endTime}</span>
      </div>

      {/* Content */}
      <div
        className="flex-1 min-w-0"
        onClick={() => navigate(`/activity/${activity.id}`)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-brand-400 shrink-0" />
          <span
            className={`font-medium text-sm truncate ${
              activity.status === 'done' ? 'line-through text-white/40' : ''
            }`}
          >
            {activity.title}
          </span>
        </div>
        {activity.instructions && (
          <p className="text-xs text-white/40 mt-1 truncate">
            {activity.instructions}
          </p>
        )}
      </div>

      {/* Status toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleDone();
        }}
        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
          activity.status === 'done'
            ? 'text-green-400 hover:bg-green-500/20'
            : 'text-white/30 hover:bg-white/10'
        }`}
      >
        <StatusIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
