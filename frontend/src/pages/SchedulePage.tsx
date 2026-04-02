import { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Save,
  Upload,
  Download,
} from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import ImportScheduleModal from '../components/ImportScheduleModal';
import type { Activity, ActivityType } from '../types';

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: 'workout', label: '🏋️ Workout' },
  { value: 'meditation', label: '🧘 Meditation' },
  { value: 'study', label: '📚 Study' },
  { value: 'work', label: '💼 Work' },
  { value: 'recovery', label: '❤️ Recovery' },
  { value: 'routine', label: '⚡ Routine' },
  { value: 'sleep', label: '🌙 Sleep' },
  { value: 'travel', label: '🚗 Travel' },
  { value: 'custom', label: '🔧 Custom' },
];

export default function SchedulePage() {
  const todayLog = useActivityStore((s) => s.getTodayLog());
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const addActivity = useActivityStore((s) => s.addActivity);
  const removeActivity = useActivityStore((s) => s.removeActivity);
  const markScheduleModified = useActivityStore((s) => s.markScheduleModified);

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ActivityType>('custom');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('09:00');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const exportSchedule = useActivityStore((s) => s.exportSchedule);

  const handleTimeChange = (
    activityId: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    if (todayLog.scheduleModified) return;
    updateActivity(activityId, { [field]: value });
    markScheduleModified();
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const newActivity: Activity = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      type: newType,
      startTime: newStart,
      endTime: newEnd,
      status: 'pending',
    };
    addActivity(newActivity);
    if (!todayLog.scheduleModified) markScheduleModified();
    setNewTitle('');
    setShowAdd(false);
  };

  const handleRemove = (id: string) => {
    removeActivity(id);
    if (!todayLog.scheduleModified) markScheduleModified();
  };

  const handleExport = () => {
    const data = exportSchedule();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-schedule-${todayLog.date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-4 space-y-6">
      <ImportScheduleModal open={showImport} onClose={() => setShowImport(false)} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Schedule</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            disabled={todayLog.scheduleModified}
            className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            title={todayLog.scheduleModified ? 'Schedule already modified today' : 'Import schedule'}
          >
            <Download className="w-4 h-4" /> Import
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-1 text-sm"
            title="Export current schedule as JSON"
          >
            <Upload className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn-primary flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Modification warning */}
      {todayLog.scheduleModified && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Schedule already modified today. Further time changes are locked.
        </div>
      )}

      {/* Add Activity Form */}
      {showAdd && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-sm">New Activity</h3>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Activity name"
            className="w-full bg-surface-lighter rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as ActivityType)}
            className="w-full bg-surface-lighter rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5"
          >
            {activityTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/40">Start</label>
              <input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="w-full bg-surface-lighter rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5"
              />
            </div>
            <div>
              <label className="text-xs text-white/40">End</label>
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-full bg-surface-lighter rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5"
              />
            </div>
          </div>
          <button onClick={handleAdd} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Add Activity
          </button>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-2">
        {todayLog.activities.map((activity) => (
          <div
            key={activity.id}
            className="card flex items-center gap-3"
          >
            <Clock className="w-4 h-4 text-white/30 shrink-0" />
            <div className="flex-1 min-w-0">
              {editingId === activity.id ? (
                <input
                  type="text"
                  defaultValue={activity.title}
                  onBlur={(e) => {
                    updateActivity(activity.id, { title: e.target.value });
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateActivity(activity.id, {
                        title: (e.target as HTMLInputElement).value,
                      });
                      setEditingId(null);
                    }
                  }}
                  className="bg-surface-lighter rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus
                />
              ) : (
                <span
                  className="text-sm font-medium cursor-pointer hover:text-brand-400"
                  onClick={() => setEditingId(activity.id)}
                >
                  {activity.title}
                </span>
              )}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="time"
                  value={activity.startTime}
                  onChange={(e) =>
                    handleTimeChange(activity.id, 'startTime', e.target.value)
                  }
                  disabled={todayLog.scheduleModified}
                  className="bg-surface-lighter rounded px-2 py-0.5 text-xs text-white/50 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-30"
                />
                <span className="text-white/20">→</span>
                <input
                  type="time"
                  value={activity.endTime}
                  onChange={(e) =>
                    handleTimeChange(activity.id, 'endTime', e.target.value)
                  }
                  disabled={todayLog.scheduleModified}
                  className="bg-surface-lighter rounded px-2 py-0.5 text-xs text-white/50 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-30"
                />
              </div>
            </div>
            <button
              onClick={() => handleRemove(activity.id)}
              className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
