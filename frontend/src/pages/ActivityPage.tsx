import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Timer, StickyNote, Play, Square, SkipForward } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import MeditationPlayer from '../components/MeditationPlayer';
import FamilyModule from '../components/FamilyModule';
import TravelModule from '../components/TravelModule';
import ExerciseGuide from '../components/ExerciseGuide';
import { useState } from 'react';

export default function ActivityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const todayLog = useActivityStore((s) => s.getTodayLog());
  const updateStatus = useActivityStore((s) => s.updateActivityStatus);
  const updateNotes = useActivityStore((s) => s.updateActivityNotes);
  const toggleChecklist = useActivityStore((s) => s.toggleChecklist);

  const activity = todayLog.activities.find((a) => a.id === id);
  const [notes, setNotes] = useState(activity?.notes || '');
  const [showNotes, setShowNotes] = useState(false);

  if (!activity) {
    return (
      <div className="p-4 text-center text-white/50">
        <p>Activity not found</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Go Home
        </button>
      </div>
    );
  }

  const handleStart = () => {
    if (!id) return;
    updateStatus(id, 'active');
    // Navigate to timer for study/meditation types
    if (activity.type === 'study') {
      navigate('/timer');
    } else if (activity.type === 'meditation') {
      navigate('/timer?mode=meditation&duration=10');
    }
  };

  const handleSaveNotes = () => {
    if (id) updateNotes(id, notes);
    setShowNotes(false);
  };

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{activity.title}</h1>
          <p className="text-sm text-white/50">
            {activity.startTime} – {activity.endTime}
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white/60">Status</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activity.status === 'done'
                ? 'bg-green-500/20 text-green-400'
                : activity.status === 'active'
                ? 'bg-blue-500/20 text-blue-400'
                : activity.status === 'skipped'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-white/10 text-white/50'
            }`}
          >
            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
          </span>
        </div>

        {activity.instructions && (
          <div>
            <p className="text-sm text-white/40 mb-1">Instructions</p>
            <p className="text-sm">{activity.instructions}</p>
          </div>
        )}

        {/* State-aware action buttons */}
        <div className="flex gap-2">
          {activity.status === 'pending' && (
            <>
              <button
                onClick={handleStart}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Start
              </button>
              <button
                onClick={() => id && updateStatus(id, 'done')}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Done
              </button>
            </>
          )}

          {activity.status === 'active' && (
            <>
              <button
                onClick={() => id && updateStatus(id, 'done')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl transition-colors flex-1 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Complete
              </button>
              <button
                onClick={() => id && updateStatus(id, 'pending')}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4" /> Stop
              </button>
            </>
          )}

          {activity.status === 'done' && (
            <button
              onClick={() => id && updateStatus(id, 'pending')}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Circle className="w-4 h-4" /> Undo
            </button>
          )}

          {activity.status === 'skipped' && (
            <button
              onClick={() => id && updateStatus(id, 'pending')}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Circle className="w-4 h-4" /> Restore
            </button>
          )}

          {activity.status !== 'done' && activity.status !== 'skipped' && (
            <button
              onClick={() => id && updateStatus(id, 'skipped')}
              className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-1"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active indicator */}
        {activity.status === 'active' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
            </span>
            <span className="text-sm text-blue-400 font-medium">In Progress</span>
          </div>
        )}
      </div>

      {/* Checklist (for workout, etc.) */}
      {activity.checklist && activity.checklist.length > 0 && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-sm text-white/60 uppercase tracking-wider">
            Checklist
          </h3>
          {activity.checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => id && toggleChecklist(id, item.id)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${
                item.done
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-surface-lighter hover:bg-white/10 text-white/70'
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 shrink-0" />
              )}
              <span className={item.done ? 'line-through' : ''}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Exercise guides for workout activities */}
      {activity.type === 'workout' && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-sm text-white/60 uppercase tracking-wider">
            Exercise Guide
          </h3>
          <ExerciseGuide
            categories={
              activity.title.toLowerCase().includes('warm')
                ? ['warmup']
                : activity.title.toLowerCase().includes('cool') || activity.title.toLowerCase().includes('stretch')
                ? ['stretch', 'cooldown']
                : ['strength', 'posture']
            }
          />
        </div>
      )}

      {/* Family time module */}
      {activity.type === 'family' && (
        <FamilyModule activity={activity} />
      )}

      {/* Travel mode module */}
      {activity.type === 'travel' && (
        <TravelModule activity={activity} />
      )}

      {/* Meditation player */}
      {activity.type === 'meditation' && (
        <div className="card space-y-3">
          <MeditationPlayer
            onComplete={() => {
              if (id) updateStatus(id, 'done');
            }}
          />
        </div>
      )}

      {/* Meditation timer shortcut */}
      {activity.type === 'meditation' && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-sm text-white/60 uppercase tracking-wider">
            Simple Timer
          </h3>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  if (id) updateStatus(id, 'active');
                  navigate(`/timer?mode=meditation&duration=${mins}`);
                }}
                className="btn-secondary flex-1 text-center"
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Study / Pomodoro shortcut */}
      {activity.type === 'study' && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-sm text-white/60 uppercase tracking-wider">
            Pomodoro Timer
          </h3>
          <button
            onClick={() => {
              if (id) updateStatus(id, 'active');
              navigate('/timer');
            }}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Timer className="w-4 h-4" /> Start Pomodoro Session
          </button>
        </div>
      )}

      {/* Notes */}
      <div className="card space-y-3">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white/80"
        >
          <StickyNote className="w-4 h-4" />
          {showNotes ? 'Hide Notes' : 'Add Notes'}
        </button>
        {showNotes && (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did this activity go?"
              className="w-full bg-surface-lighter rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5"
            />
            <button onClick={handleSaveNotes} className="btn-primary text-sm">
              Save Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
