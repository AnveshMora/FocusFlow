export type ActivityType = 'workout' | 'meditation' | 'study' | 'work' | 'recovery' | 'sleep' | 'travel' | 'routine' | 'family' | 'custom';
export type ActivityStatus = 'pending' | 'active' | 'done' | 'skipped' | 'missed';

export interface ActivityChecklist {
  id: string;
  label: string;
  done: boolean;
}

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: ActivityStatus;
  instructions?: string;
  notes?: string;
  checklist?: ActivityChecklist[];
  updatedAt?: number; // epoch ms — used for sync conflict resolution
  familyLog?: { rating: number; tags: string[] };
  travelLog?: { mode: string; title: string; duration?: number };
}

// Template activity — no runtime state (status/notes), just the schedule definition
export interface TemplateActivity {
  id: string;
  title: string;
  type: ActivityType;
  startTime: string;
  endTime: string;
  instructions?: string;
  checklist?: { id: string; label: string }[];
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  activities: TemplateActivity[];
  updatedAt?: number;
}

// Maps day-of-week (0=Sun..6=Sat) to template id
export type DayTemplateMap = Record<number, string>;

export interface DayLog {
  date: string; // YYYY-MM-DD
  activities: Activity[];
  completionPercent: number;
  scheduleModified: boolean;
  lastSyncedAt?: number; // epoch ms
}

export interface Streak {
  current: number;
  best: number;
}

export interface WeeklyData {
  day: string;
  completion: number;
}

export interface HeatmapDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4; // 0=missed, 4=full
}

export interface RewardSettings {
  rewardPerDay: number;
  penaltyPerMiss: number;
  currency: string;
}

export interface UserSettings {
  pomodoroWork: number;      // minutes
  pomodoroBreak: number;     // minutes
  checkpointInterval: number; // minutes
  maxScheduleShift: number;  // minutes
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  rewards: RewardSettings;
  updatedAt?: number;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;     // seconds
  totalTime: number;    // seconds
  mode: 'work' | 'break';
  sessionsCompleted: number;
  startedAt: number | null;       // epoch ms when timer started/resumed
  pausedAt: number | null;        // epoch ms when timer was paused
  accumulatedPause: number;       // total pause duration in ms
}

export interface CheckpointPrompt {
  id: string;
  activityId: string;
  message: string;
  timestamp: number;
  responded: boolean;
  response?: 'yes' | 'pause' | 'skip';
}

// Schedule Import/Export
export type ImportMode = 'merge' | 'replace';

export interface ImportScheduleEntry {
  title: string;
  type: ActivityType;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  instructions?: string;
  checklist?: { label: string }[];
}

export interface ImportDiffItem {
  title: string;
  type: ActivityType;
  startTime: string;
  endTime: string;
  instructions?: string;
  changes?: { field: string; from: string; to: string }[];
}

export interface ImportDiff {
  updated: ImportDiffItem[];
  added: ImportDiffItem[];
  removed: ImportDiffItem[];
  unchanged: ImportDiffItem[];
}
