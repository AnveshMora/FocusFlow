import { useState, useEffect, useMemo } from 'react';
import { Moon, Sun, ChevronRight, Play, SkipForward, Rocket } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import MeditationPlayer from './MeditationPlayer';

const DISMISSED_KEY = 'focusflow-morning-dismissed';

function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default function MorningRitualModal() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [sleepRating, setSleepRating] = useState(0);
  const [sleepNote, setSleepNote] = useState('');
  const [showMeditation, setShowMeditation] = useState(false);
  const [fadeClass, setFadeClass] = useState('opacity-0 translate-y-4');

  const todayLog = useActivityStore((s) => s.getTodayLog());
  const yesterdayLog = useActivityStore((s) => s.getYesterdayLog());
  const updateActivityNotes = useActivityStore((s) => s.updateActivityNotes);

  // Determine if modal should show
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    const today = getTodayDateStr();

    if (dismissed === today) return;

    const doneCount = todayLog.activities.filter((a) => a.status === 'done').length;
    if (doneCount === 0) {
      setVisible(true);
    }
  }, [todayLog]);

  // Animate in on mount and on step change
  useEffect(() => {
    if (!visible) return;
    setFadeClass('opacity-0 translate-y-4');
    const timer = setTimeout(() => setFadeClass('opacity-100 translate-y-0'), 50);
    return () => clearTimeout(timer);
  }, [step, visible]);

  const yesterdayPercent = yesterdayLog?.completionPercent ?? -1;

  const motivationMessage = useMemo(() => {
    if (yesterdayPercent >= 90) return 'Amazing discipline! Keep it up 🔥';
    if (yesterdayPercent >= 50) return "Solid effort! Let's make today even better 💪";
    return "Fresh start today! You've got this 🌟";
  }, [yesterdayPercent]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, getTodayDateStr());
    setVisible(false);
  };

  const saveSleepData = () => {
    const noteText = [
      `Sleep quality: ${sleepRating}/5`,
      sleepNote.trim() ? sleepNote.trim() : '',
    ]
      .filter(Boolean)
      .join(' — ');
    updateActivityNotes('sleep', noteText);
  };

  const nextStep = () => {
    if (step === 1) saveSleepData();
    setStep((s) => s + 1);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/95 backdrop-blur-sm px-4">
      <div className="w-full max-w-md">
        <div className={`transition-all duration-300 ease-out ${fadeClass}`}>
          {step === 0 && <StepGreeting
            yesterdayPercent={yesterdayPercent}
            motivationMessage={motivationMessage}
            onNext={nextStep}
          />}
          {step === 1 && <StepSleep
            sleepRating={sleepRating}
            setSleepRating={setSleepRating}
            sleepNote={sleepNote}
            setSleepNote={setSleepNote}
            onNext={nextStep}
          />}
          {step === 2 && <StepMeditation
            showMeditation={showMeditation}
            setShowMeditation={setShowMeditation}
            onNext={nextStep}
          />}
          {step === 3 && <StepPreview
            activities={todayLog.activities}
            onDismiss={dismiss}
          />}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Good Morning ─── */
function StepGreeting({
  yesterdayPercent,
  motivationMessage,
  onNext,
}: {
  yesterdayPercent: number;
  motivationMessage: string;
  onNext: () => void;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <Sun className="w-12 h-12 text-amber-400 mx-auto" />
        <h1 className="text-3xl font-bold text-white/90">🌅 Good Morning!</h1>
      </div>

      <div className="rounded-xl bg-surface-light/50 p-5 space-y-3">
        {yesterdayPercent >= 0 ? (
          <p className="text-white/70 text-sm">
            Yesterday you completed{' '}
            <span className="text-brand-400 font-bold text-lg">{yesterdayPercent}%</span>{' '}
            of your routine
          </p>
        ) : (
          <p className="text-white/70 text-sm">No data from yesterday</p>
        )}
        <p className="text-lg font-medium text-white/90">{motivationMessage}</p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
      >
        Next <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ─── Step 2: Sleep Quality ─── */
function StepSleep({
  sleepRating,
  setSleepRating,
  sleepNote,
  setSleepNote,
  onNext,
}: {
  sleepRating: number;
  setSleepRating: (r: number) => void;
  sleepNote: string;
  setSleepNote: (n: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <Moon className="w-10 h-10 text-indigo-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white/90">How did you sleep? 🌙</h2>
      </div>

      {/* Star rating */}
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setSleepRating(star)}
            className={`w-12 h-12 rounded-xl text-2xl transition-all duration-200 ${
              star <= sleepRating
                ? 'bg-amber-500/20 scale-110'
                : 'bg-surface-light/50 hover:bg-white/10'
            }`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            {star <= sleepRating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
      {sleepRating > 0 && (
        <p className="text-xs text-white/40">
          {sleepRating <= 2 ? "We'll work on it 💙" : sleepRating <= 3 ? 'Not bad!' : 'Great rest! 🌟'}
        </p>
      )}

      <input
        type="text"
        placeholder="Any thoughts about your sleep? (optional)"
        value={sleepNote}
        onChange={(e) => setSleepNote(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-surface-light/50 border border-white/5 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-brand-400/40 transition-colors"
      />

      <button
        onClick={onNext}
        className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
      >
        Next <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ─── Step 3: Meditation ─── */
function StepMeditation({
  showMeditation,
  setShowMeditation,
  onNext,
}: {
  showMeditation: boolean;
  setShowMeditation: (v: boolean) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white/90">
          Start with a body scan? 🧘
        </h2>
        <p className="text-sm text-white/50">A quick meditation to ground your mind</p>
      </div>

      {showMeditation ? (
        <div className="rounded-xl bg-surface-light/50 p-4">
          <MeditationPlayer onComplete={onNext} />
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => setShowMeditation(true)}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <Play className="w-5 h-5" /> Start Meditation
          </button>
          <button
            onClick={onNext}
            className="w-full py-3.5 rounded-xl bg-surface-light/50 hover:bg-white/10 text-white/60 font-medium flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <SkipForward className="w-4 h-4" /> Skip for now
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Step 4: Today's Preview ─── */
function StepPreview({
  activities,
  onDismiss,
}: {
  activities: { id: string; title: string; startTime: string }[];
  onDismiss: () => void;
}) {
  const preview = activities.slice(0, 5);
  const remaining = activities.length - preview.length;

  return (
    <div className="text-center space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white/90">Your day ahead ☀️</h2>
        <p className="text-sm text-white/50">
          {activities.length} activities planned
        </p>
      </div>

      <div className="rounded-xl bg-surface-light/50 divide-y divide-white/5">
        {preview.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3 text-left">
            <span className="text-xs text-brand-400 font-mono w-12 shrink-0">
              {a.startTime}
            </span>
            <span className="text-sm text-white/80 truncate">{a.title}</span>
          </div>
        ))}
        {remaining > 0 && (
          <div className="px-4 py-2.5 text-xs text-white/40">
            +{remaining} more activities
          </div>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
      >
        <Rocket className="w-5 h-5" /> Let's Go! 🚀
      </button>
    </div>
  );
}
