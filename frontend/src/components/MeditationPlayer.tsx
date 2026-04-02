import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, Upload, Trash2, Volume2, ChevronDown } from 'lucide-react';
import { MEDITATION_SCRIPTS, type MeditationScript } from '../data/meditationScripts';

interface Props {
  onComplete?: () => void;
}

type PlayerMode = 'select' | 'tts' | 'audio';

export default function MeditationPlayer({ onComplete }: Props) {
  const [mode, setMode] = useState<PlayerMode>('select');
  const [selectedScript, setSelectedScript] = useState<MeditationScript | null>(null);

  // TTS state
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [voiceRate, setVoiceRate] = useState(0.85);
  const [showSettings, setShowSettings] = useState(false);

  // Audio file state
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved audio from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('focusflow-meditation-audio');
    if (saved) {
      try {
        const { name, data } = JSON.parse(saved);
        setAudioSrc(data);
        setAudioName(name);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      synthRef.current?.cancel();
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  const speakStep = useCallback((stepIndex: number) => {
    if (!selectedScript || !synthRef.current) return;
    if (stepIndex >= selectedScript.steps.length) {
      setIsPlaying(false);
      setCurrentStep(0);
      onComplete?.();
      return;
    }

    const step = selectedScript.steps[stepIndex];
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(step.text);
    utterance.rate = voiceRate;
    utterance.pitch = 0.9;

    utterance.onend = () => {
      // Pause between steps
      pauseTimerRef.current = setTimeout(() => {
        const next = stepIndex + 1;
        setCurrentStep(next);
        speakStep(next);
      }, step.pauseSeconds * 1000);
    };

    synthRef.current.speak(utterance);
  }, [selectedScript, voiceRate, onComplete]);

  const handlePlayTTS = () => {
    if (!selectedScript) return;
    if (isPaused) {
      synthRef.current?.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(true);
    setIsPaused(false);
    speakStep(currentStep);
  };

  const handlePauseTTS = () => {
    synthRef.current?.pause();
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStopTTS = () => {
    synthRef.current?.cancel();
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
  };

  const handleSkipStep = () => {
    if (!selectedScript) return;
    synthRef.current?.cancel();
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    const next = currentStep + 1;
    if (next >= selectedScript.steps.length) {
      handleStopTTS();
      onComplete?.();
      return;
    }
    setCurrentStep(next);
    if (isPlaying) speakStep(next);
  };

  // Audio file handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setAudioSrc(data);
      setAudioName(file.name);
      localStorage.setItem('focusflow-meditation-audio', JSON.stringify({ name: file.name, data }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAudio = () => {
    setAudioSrc(null);
    setAudioName('');
    localStorage.removeItem('focusflow-meditation-audio');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioPlaying(false);
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setAudioPlaying(!audioPlaying);
  };

  // Selection screen
  if (mode === 'select') {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-white/60 uppercase tracking-wider">
          Meditation Audio
        </h3>

        {/* Guided Scripts */}
        <p className="text-xs text-white/40">Guided Scripts (Text-to-Speech)</p>
        {MEDITATION_SCRIPTS.map((script) => (
          <button
            key={script.id}
            onClick={() => {
              setSelectedScript(script);
              setMode('tts');
              setCurrentStep(0);
            }}
            className="w-full p-3 rounded-xl bg-surface-lighter hover:bg-white/10 transition-colors text-left"
          >
            <p className="text-sm font-medium">{script.title}</p>
            <p className="text-xs text-white/40 mt-0.5">
              {script.description} · ~{script.durationMinutes} min
            </p>
          </button>
        ))}

        {/* Custom Audio */}
        <p className="text-xs text-white/40 mt-2">Custom Audio</p>
        {audioSrc ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-lighter">
            <button
              onClick={() => setMode('audio')}
              className="flex-1 text-left"
            >
              <p className="text-sm font-medium">🎵 {audioName}</p>
              <p className="text-xs text-white/40">Tap to play</p>
            </button>
            <button
              onClick={handleDeleteAudio}
              className="p-2 text-white/20 hover:text-red-400 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-brand-400/30 transition-colors text-center"
          >
            <Upload className="w-5 h-5 text-white/30 mx-auto mb-1" />
            <p className="text-xs text-white/40">Upload mp3 or wav (max 10MB)</p>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp3"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    );
  }

  // TTS Player
  if (mode === 'tts' && selectedScript) {
    const step = selectedScript.steps[currentStep];
    const progress = ((currentStep + 1) / selectedScript.steps.length) * 100;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{selectedScript.title}</h3>
          <button
            onClick={() => { handleStopTTS(); setMode('select'); }}
            className="text-xs text-white/40 hover:text-white/60"
          >
            ← Back
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-white/30 text-right">
          Step {currentStep + 1} of {selectedScript.steps.length}
        </p>

        {/* Current step text */}
        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 min-h-[80px] flex items-center">
          <p className="text-sm text-purple-200 leading-relaxed italic">
            "{step?.text || 'Meditation complete'}"
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={isPlaying ? handlePauseTTS : handlePlayTTS}
            className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-colors shadow-lg shadow-purple-600/30"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
          <button
            onClick={handleSkipStep}
            className="w-10 h-10 rounded-full bg-surface-lighter hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Voice settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50 mx-auto"
        >
          <Volume2 className="w-3 h-3" /> Voice settings
          <ChevronDown className={`w-3 h-3 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
        </button>
        {showSettings && (
          <div className="p-3 rounded-xl bg-surface space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">Speed</span>
              <span className="text-xs text-white/60">{voiceRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={voiceRate}
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
            <p className="text-[10px] text-white/20">Slower = calmer pace</p>
          </div>
        )}
      </div>
    );
  }

  // Audio File Player
  if (mode === 'audio' && audioSrc) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">🎵 {audioName}</h3>
          <button
            onClick={() => {
              audioRef.current?.pause();
              setAudioPlaying(false);
              setMode('select');
            }}
            className="text-xs text-white/40 hover:text-white/60"
          >
            ← Back
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${audioProgress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center">
          <button
            onClick={toggleAudioPlayback}
            className="w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors shadow-lg shadow-brand-500/30"
          >
            {audioPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
        </div>

        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={() => {
            if (audioRef.current) {
              const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
              setAudioProgress(isNaN(pct) ? 0 : pct);
            }
          }}
          onEnded={() => {
            setAudioPlaying(false);
            setAudioProgress(0);
            onComplete?.();
          }}
        />
      </div>
    );
  }

  return null;
}
