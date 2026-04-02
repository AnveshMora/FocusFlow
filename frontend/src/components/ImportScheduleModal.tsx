import { useState, useRef, useMemo } from 'react';
import { X, Upload, FileText, ArrowRight, AlertCircle, Check, Copy, ClipboardCheck } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import { validateImportJson, computeImportDiff } from '../utils/importDiff';
import type { ImportScheduleEntry, ImportMode, ImportDiff } from '../types';

const TEMPLATE_JSON = `[
  {
    "title": "Morning Workout",
    "type": "workout",
    "startTime": "05:30",
    "endTime": "06:30",
    "instructions": "Full body workout with stretching"
  },
  {
    "title": "Study Session",
    "type": "study",
    "startTime": "07:00",
    "endTime": "09:00",
    "instructions": "Deep focus study using Pomodoro technique"
  }
]`;

type Step = 'input' | 'options' | 'preview';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ImportScheduleModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>('input');
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [rawJson, setRawJson] = useState('');
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<ImportScheduleEntry[]>([]);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const todayLog = useActivityStore((s) => s.getTodayLog());
  const importSchedule = useActivityStore((s) => s.importSchedule);

  const diff: ImportDiff | null = useMemo(() => {
    if (entries.length === 0) return null;
    return computeImportDiff(todayLog.activities, entries, importMode);
  }, [entries, todayLog.activities, importMode]);

  const reset = () => {
    setStep('input');
    setRawJson('');
    setError('');
    setEntries([]);
    setImportMode('merge');
    setCopied(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawJson(text);
      processJson(text);
    };
    reader.readAsText(file);
  };

  const processJson = (text: string) => {
    const result = validateImportJson(text);
    if (!result.valid) {
      setError(result.error);
      setEntries([]);
    } else {
      setError('');
      setEntries(result.data);
      setStep('options');
    }
  };

  const handlePasteSubmit = () => {
    processJson(rawJson);
  };

  const handleApply = () => {
    importSchedule(entries, importMode);
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-surface-light w-full max-w-md max-h-[85vh] rounded-t-2xl sm:rounded-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="font-bold text-lg">Import Schedule</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Step 1: Input */}
          {step === 'input' && (
            <>
              {/* Tab Switcher */}
              <div className="flex rounded-xl bg-surface p-1 gap-1">
                <button
                  onClick={() => setInputMode('file')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    inputMode === 'file'
                      ? 'bg-brand-500 text-white'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload File
                </button>
                <button
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    inputMode === 'paste'
                      ? 'bg-brand-500 text-white'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Paste JSON
                </button>
              </div>

              {/* Template helper */}
              <div className="p-3 rounded-xl bg-surface border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40">
                    Not sure about the format? Copy this template to get started:
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(TEMPLATE_JSON);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors shrink-0 ml-2 ${
                      copied
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30'
                    }`}
                  >
                    {copied ? (
                      <><ClipboardCheck className="w-3.5 h-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy Template</>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] text-white/30 font-mono overflow-x-auto leading-relaxed">
                  {TEMPLATE_JSON}
                </pre>
              </div>

              {inputMode === 'file' ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400/40 transition-colors"
                >
                  <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-sm text-white/50">
                    Click to upload a <span className="text-brand-400">.json</span> file
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={rawJson}
                    onChange={(e) => {
                      setRawJson(e.target.value);
                      setError('');
                    }}
                    placeholder={'[\n  {\n    "title": "Study Session",\n    "type": "study",\n    "startTime": "06:00",\n    "endTime": "08:00"\n  }\n]'}
                    className="w-full bg-surface rounded-xl p-3 text-sm font-mono resize-none h-40 focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/5"
                  />
                  <button
                    onClick={handlePasteSubmit}
                    disabled={!rawJson.trim()}
                    className="btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Validate & Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </>
          )}

          {/* Step 2: Options */}
          {step === 'options' && (
            <>
              <p className="text-sm text-white/50">
                Found <span className="text-white font-medium">{entries.length}</span> activities. Choose how to apply:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => setImportMode('merge')}
                  className={`w-full p-4 rounded-xl border text-left transition-colors ${
                    importMode === 'merge'
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-white/10 bg-surface hover:border-white/20'
                  }`}
                >
                  <p className="font-medium text-sm">🔀 Merge</p>
                  <p className="text-xs text-white/40 mt-1">
                    Update matched activities, add new ones, keep unmatched existing activities
                  </p>
                </button>
                <button
                  onClick={() => setImportMode('replace')}
                  className={`w-full p-4 rounded-xl border text-left transition-colors ${
                    importMode === 'replace'
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-white/10 bg-surface hover:border-white/20'
                  }`}
                >
                  <p className="font-medium text-sm">🔄 Replace</p>
                  <p className="text-xs text-white/40 mt-1">
                    Replace entire schedule with imported activities
                  </p>
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep('input')} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={() => setStep('preview')}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  Preview Changes <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && diff && (
            <>
              {/* Summary badges */}
              <div className="flex flex-wrap gap-2">
                {diff.updated.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                    🔄 {diff.updated.length} updated
                  </span>
                )}
                {diff.added.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    ➕ {diff.added.length} new
                  </span>
                )}
                {diff.removed.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                    🗑 {diff.removed.length} removed
                  </span>
                )}
                {diff.unchanged.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/50 text-xs font-medium">
                    ✅ {diff.unchanged.length} unchanged
                  </span>
                )}
              </div>

              {/* Updated items */}
              {diff.updated.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Updated</p>
                  {diff.updated.map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.changes?.map((c, ci) => (
                        <p key={ci} className="text-xs text-white/50 mt-0.5">
                          {c.field}: <span className="text-red-400 line-through">{c.from}</span>
                          {' → '}
                          <span className="text-green-400">{c.to}</span>
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Added items */}
              {diff.added.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">New</p>
                  {diff.added.map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-white/50">{item.startTime} – {item.endTime}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Removed items */}
              {diff.removed.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Will be removed</p>
                  {diff.removed.map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <p className="text-sm font-medium line-through text-white/40">{item.title}</p>
                      <p className="text-xs text-white/30">{item.startTime} – {item.endTime}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep('options')} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={handleApply}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Apply Import
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
