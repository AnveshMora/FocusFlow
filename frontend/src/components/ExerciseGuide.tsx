import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { exercises, type Exercise } from '../data/exercises';

const CATEGORY_LABELS: Record<string, string> = {
  warmup: '🔥 Warm-up',
  strength: '💪 Strength',
  stretch: '🧘 Stretch',
  posture: '📏 Posture',
  cooldown: '❄️ Cool-down',
  mobility: '🔄 Mobility',
};

interface ExerciseGuideProps {
  categories?: Exercise['category'][];
}

export default function ExerciseGuide({ categories }: ExerciseGuideProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = categories
    ? exercises.filter((e) => categories.includes(e.category))
    : exercises;

  // Group by category
  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([cat, exs]) => (
        <div key={cat}>
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            {CATEGORY_LABELS[cat] ?? cat}
          </h4>
          <div className="space-y-1">
            {exs.map((ex) => {
              const isExpanded = expandedId === ex.id;
              return (
                <div key={ex.id} className="rounded-xl bg-surface-lighter overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-lg">{ex.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{ex.name}</span>
                      <span className="text-xs text-white/30 ml-2">{ex.muscleGroup}</span>
                    </div>
                    <span className="text-xs text-white/30 shrink-0">{ex.duration}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/30" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/30" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0">
                      <p className="text-sm text-white/60 leading-relaxed bg-white/[0.03] rounded-lg p-3">
                        {ex.instructions}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
