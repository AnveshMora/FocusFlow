import { useState } from 'react';
import { Star, Tag } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import type { Activity } from '../types';

const FAMILY_TAGS = [
  'Dinner together', 'Game night', 'Movie night', 'Walk / Outing',
  'Playtime', 'Cooking together', 'Deep conversation', 'Festival / Celebration',
  'Shopping', 'Road trip', 'Visiting relatives',
];

interface FamilyModuleProps {
  activity: Activity;
}

export default function FamilyModule({ activity }: FamilyModuleProps) {
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const [rating, setRating] = useState(activity.familyLog?.rating ?? 0);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    activity.familyLog?.tags ?? []
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    updateActivity(activity.id, {
      familyLog: { rating, tags: selectedTags },
    });
  };

  const hasChanges =
    rating !== (activity.familyLog?.rating ?? 0) ||
    JSON.stringify(selectedTags) !== JSON.stringify(activity.familyLog?.tags ?? []);

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold text-sm text-white/60 uppercase tracking-wider flex items-center gap-2">
        <Star className="w-4 h-4 text-amber-400" />
        Family Time
      </h3>

      {/* Quality Rating */}
      <div>
        <p className="text-sm text-white/50 mb-2">How was this time together?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`w-10 h-10 rounded-xl text-lg transition-all ${
                n <= rating
                  ? 'bg-amber-500/20 text-amber-400 scale-110'
                  : 'bg-surface-lighter text-white/20 hover:text-white/40'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Activity Tags */}
      <div>
        <p className="text-sm text-white/50 mb-2 flex items-center gap-1">
          <Tag className="w-3 h-3" /> What did you do?
        </p>
        <div className="flex flex-wrap gap-2">
          {FAMILY_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-surface-lighter text-white/40 border border-white/5 hover:text-white/60'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      {hasChanges && (
        <button onClick={handleSave} className="btn-primary w-full text-sm">
          Save Family Log
        </button>
      )}

      {/* Saved summary */}
      {activity.familyLog && !hasChanges && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-sm">
          <span className="text-amber-400">
            {'★'.repeat(activity.familyLog.rating)}
            {'☆'.repeat(5 - activity.familyLog.rating)}
          </span>
          {activity.familyLog.tags.length > 0 && (
            <p className="text-white/40 mt-1 text-xs">
              {activity.familyLog.tags.join(' · ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
