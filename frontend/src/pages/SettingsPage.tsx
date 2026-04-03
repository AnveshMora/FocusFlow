import { useState } from 'react';
import { Timer, Shield, Bell, Volume2, Trophy, Database, Settings } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import type { UserSettings } from '../types';

const CURRENCIES = ['₹', '$', '€', '£'] as const;
const APP_VERSION = '1.0.0';

/* ─── Reusable components ─── */

function SectionCard({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface-light/50 rounded-xl p-4 space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white/90">
        <Icon className="w-4 h-4 text-brand-400" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function SliderField({ label, value, min, max, step = 1, unit, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{label}</span>
        <span className="text-white/90 font-medium">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-brand-400 cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-400
                   [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-brand-400/30"
      />
      <div className="flex justify-between text-[10px] text-white/30">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs text-white/60">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-brand-400' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

function CurrencyInput({ label, value, currency, onChange }: {
  label: string;
  value: number;
  currency: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-white/60">{label}</span>
      <div className="flex items-center gap-1 bg-white/5 rounded-lg px-3 py-2">
        <span className="text-sm text-white/40">{currency}</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="flex-1 bg-transparent text-sm text-white/90 outline-none [appearance:textfield]
                     [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </div>
  );
}

/* ─── Main component ─── */

export default function SettingsPage() {
  const settings = useActivityStore((s) => s.settings);
  const updateSettings = useActivityStore((s) => s.updateSettings);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const update = (patch: Partial<UserSettings>) => updateSettings(patch);

  const updateReward = (field: keyof UserSettings['rewards'], value: number | string) => {
    update({ rewards: { ...settings.rewards, [field]: value } });
  };

  const handleExportData = () => {
    const state = useActivityStore.getState();
    const data = { settings: state.settings, days: state.days };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    localStorage.removeItem('focusflow-activities');
    window.location.reload();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-5 h-5 text-brand-400" />
        <h1 className="text-lg font-bold text-white/90">Settings</h1>
      </div>

      {/* 1 ── Timer Settings */}
      <SectionCard icon={Timer} title="Timer Settings">
        <SliderField
          label="Pomodoro work duration"
          value={settings.pomodoroWork}
          min={15}
          max={90}
          unit="min"
          onChange={(v) => update({ pomodoroWork: v })}
        />
        <SliderField
          label="Pomodoro break duration"
          value={settings.pomodoroBreak}
          min={3}
          max={30}
          unit="min"
          onChange={(v) => update({ pomodoroBreak: v })}
        />
      </SectionCard>

      {/* 2 ── Accountability Settings */}
      <SectionCard icon={Shield} title="Accountability Settings">
        <SliderField
          label="Checkpoint interval"
          value={settings.checkpointInterval}
          min={5}
          max={60}
          unit="min"
          onChange={(v) => update({ checkpointInterval: v })}
        />
        <SliderField
          label="Max schedule shift allowed"
          value={settings.maxScheduleShift}
          min={15}
          max={120}
          unit="min"
          onChange={(v) => update({ maxScheduleShift: v })}
        />
      </SectionCard>

      {/* 3 ── Notification Settings */}
      <SectionCard icon={Bell} title="Notification Settings">
        <ToggleSwitch
          label="Enable notifications"
          checked={settings.notificationsEnabled}
          onChange={(v) => update({ notificationsEnabled: v })}
        />
        <ToggleSwitch
          label="Sound"
          checked={settings.soundEnabled}
          onChange={(v) => update({ soundEnabled: v })}
        />
        <div className="flex items-center gap-1.5 text-white/30">
          <Volume2 className="w-3 h-3" />
          <span className="text-[10px]">Sound plays with notifications</span>
        </div>
        <ToggleSwitch
          label="Vibration"
          checked={settings.vibrationEnabled}
          onChange={(v) => update({ vibrationEnabled: v })}
        />
      </SectionCard>

      {/* 4 ── Reward Settings */}
      <SectionCard icon={Trophy} title="Reward Settings">
        <CurrencyInput
          label="Reward per completed day"
          value={settings.rewards.rewardPerDay}
          currency={settings.rewards.currency}
          onChange={(v) => updateReward('rewardPerDay', v)}
        />
        <CurrencyInput
          label="Penalty per missed day"
          value={settings.rewards.penaltyPerMiss}
          currency={settings.rewards.currency}
          onChange={(v) => updateReward('penaltyPerMiss', v)}
        />
        <div className="space-y-1">
          <span className="text-xs text-white/60">Currency</span>
          <div className="flex gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => updateReward('currency', c)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  settings.rewards.currency === c
                    ? 'bg-brand-400 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* 5 ── Data */}
      <SectionCard icon={Database} title="Data">
        <button
          onClick={handleExportData}
          className="w-full py-2.5 rounded-lg bg-white/5 text-sm text-white/70 hover:bg-white/10 transition-colors"
        >
          Export all data as JSON
        </button>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2.5 rounded-lg bg-red-500/10 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Clear all data
          </button>
        ) : (
          <div className="space-y-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-300">
              This will permanently delete all your data. Are you sure?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClearData}
                className="flex-1 py-2 rounded-lg bg-red-500 text-sm text-white font-medium hover:bg-red-600 transition-colors"
              >
                Yes, clear everything
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-white/5 text-sm text-white/60 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-white/30 text-center pt-2">
          FocusFlow v{APP_VERSION}
        </p>
      </SectionCard>
    </div>
  );
}
