import { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Save,
  Upload,
  Download,
  Calendar,
} from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import ImportScheduleModal from '../components/ImportScheduleModal';
import type { Activity, ActivityType, TemplateActivity } from '../types';

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: 'workout', label: '🏋️ Workout' },
  { value: 'meditation', label: '🧘 Meditation' },
  { value: 'study', label: '📚 Study' },
  { value: 'work', label: '💼 Work' },
  { value: 'recovery', label: '❤️ Recovery' },
  { value: 'routine', label: '⚡ Routine' },
  { value: 'sleep', label: '🌙 Sleep' },
  { value: 'travel', label: '🚗 Travel' },
  { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
  { value: 'custom', label: '🔧 Custom' },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type TabMode = 'today' | 'templates';

export default function SchedulePage() {
  const todayLog = useActivityStore((s) => s.getTodayLog());
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const addActivity = useActivityStore((s) => s.addActivity);
  const removeActivity = useActivityStore((s) => s.removeActivity);
  const markScheduleModified = useActivityStore((s) => s.markScheduleModified);
  const exportSchedule = useActivityStore((s) => s.exportSchedule);
  const templates = useActivityStore((s) => s.scheduleTemplates);
  const dayTemplateMap = useActivityStore((s) => s.dayTemplateMap);
  const updateTemplate = useActivityStore((s) => s.updateTemplate);
  const updateDayTemplateMap = useActivityStore((s) => s.updateDayTemplateMap);

  const [tab, setTab] = useState<TabMode>('today');
  const [activeTemplateId, setActiveTemplateId] = useState(templates[0]?.id ?? 'weekday');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ActivityType>('custom');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('09:00');
  const [newInstructions, setNewInstructions] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  const activeTemplate = templates.find((t) => t.id === activeTemplateId);

  // ── Today Tab Handlers ──

  const handleTimeChange = (
    activityId: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    if (todayLog.scheduleModified) return;
    updateActivity(activityId, { [field]: value });
    markScheduleModified();
  };

  const handleAddToday = () => {
    if (!newTitle.trim()) return;
    const newActivity: Activity = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      type: newType,
      startTime: newStart,
      endTime: newEnd,
      status: 'pending',
      instructions: newInstructions || undefined,
    };
    addActivity(newActivity);
    if (!todayLog.scheduleModified) markScheduleModified();
    resetForm();
  };

  // ── Template Tab Handlers ──

  const handleAddToTemplate = () => {
    if (!newTitle.trim() || !activeTemplate) return;
    const newAct: TemplateActivity = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newTitle,
      type: newType,
      startTime: newStart,
      endTime: newEnd,
      instructions: newInstructions || undefined,
    };
    const updated = [...activeTemplate.activities, newAct].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    updateTemplate(activeTemplate.id, updated);
    resetForm();
  };

  const handleRemoveFromTemplate = (actId: string) => {
    if (!activeTemplate) return;
    updateTemplate(
      activeTemplate.id,
      activeTemplate.activities.filter((a) => a.id !== actId)
    );
  };

  const handleTemplateTimeChange = (
    actId: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    if (!activeTemplate) return;
    const updated = activeTemplate.activities.map((a) =>
      a.id === actId ? { ...a, [field]: value } : a
    );
    updated.sort((a, b) => a.startTime.localeCompare(b.startTime));
    updateTemplate(activeTemplate.id, updated);
  };

  const handleTemplateTitleChange = (actId: string, title: string) => {
    if (!activeTemplate) return;
    updateTemplate(
      activeTemplate.id,
      activeTemplate.activities.map((a) => (a.id === actId ? { ...a, title } : a))
    );
  };

  const resetForm = () => {
    setNewTitle('');
    setNewInstructions('');
    setShowAdd(false);
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
          {tab === 'today' && (
            <>
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
              >
                <Upload className="w-4 h-4" /> Export
              </button>
            </>
          )}
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn-primary flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-surface-lighter rounded-xl p-1">
        <button
          onClick={() => setTab('today')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'today' ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white/70'
          }`}
        >
          📅 Today
        </button>
        <button
          onClick={() => setTab('templates')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'templates' ? 'bg-brand-500 text-white' : 'text-white/50 hover:text-white/70'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-1" />
          Templates
        </button>
      </div>

      {/* ── TODAY TAB ── */}
      {tab === 'today' && (
        <>
          {todayLog.scheduleModified && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Schedule already modified today. Further time changes are locked.
            </div>
          )}

          {showAdd && (
            <AddActivityForm
              title={newTitle}
              setTitle={setNewTitle}
              type={newType}
              setType={setNewType}
              start={newStart}
              setStart={setNewStart}
              end={newEnd}
              setEnd={setNewEnd}
              instructions={newInstructions}
              setInstructions={setNewInstructions}
              onSave={handleAddToday}
              label="Add to Today"
            />
          )}

          <div className="space-y-2">
            {todayLog.activities.map((activity) => (
              <ActivityRow
                key={activity.id}
                id={activity.id}
                title={activity.title}
                startTime={activity.startTime}
                endTime={activity.endTime}
                isEditing={editingId === activity.id}
                onEdit={() => setEditingId(activity.id)}
                onTitleChange={(title) => {
                  updateActivity(activity.id, { title });
                  setEditingId(null);
                }}
                onTimeChange={(field, value) => handleTimeChange(activity.id, field, value)}
                onRemove={() => removeActivity(activity.id)}
                timeLocked={todayLog.scheduleModified}
              />
            ))}
          </div>
        </>
      )}

      {/* ── TEMPLATES TAB ── */}
      {tab === 'templates' && (
        <>
          {/* Template Selector */}
          <div className="flex gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTemplateId(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTemplateId === t.id
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface-lighter text-white/50 hover:text-white/70'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Day Mapping */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Day → Template Mapping
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {DAY_NAMES.map((name, dow) => (
                <button
                  key={dow}
                  onClick={() => {
                    if (activeTemplate) {
                      updateDayTemplateMap({ [dow]: activeTemplate.id });
                    }
                  }}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    dayTemplateMap[dow] === activeTemplateId
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-lighter text-white/40 hover:text-white/60'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/30">
              Tap a day to assign the selected template ({activeTemplate?.name}) to it
            </p>
          </div>

          {showAdd && (
            <AddActivityForm
              title={newTitle}
              setTitle={setNewTitle}
              type={newType}
              setType={setNewType}
              start={newStart}
              setStart={setNewStart}
              end={newEnd}
              setEnd={setNewEnd}
              instructions={newInstructions}
              setInstructions={setNewInstructions}
              onSave={handleAddToTemplate}
              label={`Add to ${activeTemplate?.name ?? 'Template'}`}
            />
          )}

          {/* Template Activities */}
          <div className="space-y-2">
            {activeTemplate?.activities.map((activity) => (
              <ActivityRow
                key={activity.id}
                id={activity.id}
                title={activity.title}
                startTime={activity.startTime}
                endTime={activity.endTime}
                isEditing={editingId === activity.id}
                onEdit={() => setEditingId(activity.id)}
                onTitleChange={(title) => {
                  handleTemplateTitleChange(activity.id, title);
                  setEditingId(null);
                }}
                onTimeChange={(field, value) =>
                  handleTemplateTimeChange(activity.id, field, value)
                }
                onRemove={() => handleRemoveFromTemplate(activity.id)}
                timeLocked={false}
              />
            ))}
            {(!activeTemplate || activeTemplate.activities.length === 0) && (
              <p className="text-center text-white/30 py-8">
                No activities in this template. Add some above.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Reusable Sub-components ──

function AddActivityForm({
  title, setTitle, type, setType, start, setStart, end, setEnd,
  instructions, setInstructions, onSave, label,
}: {
  title: string; setTitle: (v: string) => void;
  type: ActivityType; setType: (v: ActivityType) => void;
  start: string; setStart: (v: string) => void;
  end: string; setEnd: (v: string) => void;
  instructions: string; setInstructions: (v: string) => void;
  onSave: () => void; label: string;
}) {
  return (
    <div className="card space-y-3">
      <h3 className="font-semibold text-sm">New Activity</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Activity name"
        className="w-full bg-surface-lighter rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as ActivityType)}
        className="w-full bg-surface-lighter rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5"
      >
        {activityTypes.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-white/40">Start</label>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)}
            className="w-full bg-surface-lighter rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5" />
        </div>
        <div>
          <label className="text-xs text-white/40">End</label>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)}
            className="w-full bg-surface-lighter rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5" />
        </div>
      </div>
      <input
        type="text"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Instructions (optional)"
        className="w-full bg-surface-lighter rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5"
      />
      <button onClick={onSave} className="btn-primary w-full flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> {label}
      </button>
    </div>
  );
}

function ActivityRow({
  id, title, startTime, endTime, isEditing, onEdit, onTitleChange,
  onTimeChange, onRemove, timeLocked,
}: {
  id: string; title: string; startTime: string; endTime: string;
  isEditing: boolean; onEdit: () => void; onTitleChange: (title: string) => void;
  onTimeChange: (field: 'startTime' | 'endTime', value: string) => void;
  onRemove: () => void; timeLocked: boolean;
}) {
  return (
    <div className="card flex items-center gap-3">
      <Clock className="w-4 h-4 text-white/30 shrink-0" />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            defaultValue={title}
            onBlur={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onTitleChange((e.target as HTMLInputElement).value);
            }}
            className="bg-surface-lighter rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-500"
            autoFocus
          />
        ) : (
          <span
            className="text-sm font-medium cursor-pointer hover:text-brand-400"
            onClick={onEdit}
          >
            {title}
          </span>
        )}
        <div className="flex items-center gap-2 mt-1">
          <input
            type="time"
            value={startTime}
            onChange={(e) => onTimeChange('startTime', e.target.value)}
            disabled={timeLocked}
            className="bg-surface-lighter rounded px-2 py-0.5 text-xs text-white/50 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-30"
          />
          <span className="text-white/20">→</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => onTimeChange('endTime', e.target.value)}
            disabled={timeLocked}
            className="bg-surface-lighter rounded px-2 py-0.5 text-xs text-white/50 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-30"
          />
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
