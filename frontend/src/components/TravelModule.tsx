import { useState } from 'react';
import { Headphones, Music, BookOpen, Eye, Save } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import type { Activity } from '../types';

const TRAVEL_MODES = [
  { id: 'podcast', label: 'Podcast', icon: Headphones },
  { id: 'audiobook', label: 'Audiobook', icon: BookOpen },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'relax', label: 'Relax', icon: Eye },
];

interface TravelModuleProps {
  activity: Activity;
}

export default function TravelModule({ activity }: TravelModuleProps) {
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const [mode, setMode] = useState(activity.travelLog?.mode ?? '');
  const [title, setTitle] = useState(activity.travelLog?.title ?? '');

  const handleSave = () => {
    updateActivity(activity.id, {
      travelLog: { mode, title, duration: activity.travelLog?.duration },
    });
  };

  const hasChanges =
    mode !== (activity.travelLog?.mode ?? '') ||
    title !== (activity.travelLog?.title ?? '');

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold text-sm text-white/60 uppercase tracking-wider flex items-center gap-2">
        🚗 Travel Mode
      </h3>

      {/* Mode Selector */}
      <div className="grid grid-cols-4 gap-2">
        {TRAVEL_MODES.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all ${
                mode === m.id
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 scale-105'
                  : 'bg-surface-lighter text-white/40 border border-white/5 hover:text-white/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Title Input */}
      {mode && mode !== 'relax' && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            mode === 'podcast'
              ? 'Podcast name (e.g., Huberman Lab #142)'
              : mode === 'audiobook'
              ? 'Book title'
              : 'What are you listening to?'
          }
          className="w-full bg-surface-lighter rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5"
        />
      )}

      {/* Save */}
      {hasChanges && mode && (
        <button onClick={handleSave} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Save Travel Log
        </button>
      )}

      {/* Saved Summary */}
      {activity.travelLog && !hasChanges && (
        <div className="bg-brand-500/5 border border-brand-500/10 rounded-xl p-3 text-sm">
          <span className="text-brand-400 capitalize">{activity.travelLog.mode}</span>
          {activity.travelLog.title && (
            <span className="text-white/50"> — {activity.travelLog.title}</span>
          )}
        </div>
      )}
    </div>
  );
}
