import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity, DayLog, ActivityStatus, UserSettings, ImportScheduleEntry, ImportMode } from '../types';

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'wake',
    title: 'Wake + Hydration',
    type: 'routine',
    startTime: '05:00',
    endTime: '05:10',
    status: 'pending',
    instructions: 'Wake up and drink 1-2 glasses of water',
  },
  {
    id: 'warmup',
    title: 'Warm-up',
    type: 'workout',
    startTime: '05:10',
    endTime: '05:20',
    status: 'pending',
    instructions: 'Neck rolls, shoulder rotations, light mobility exercises',
  },
  {
    id: 'workout',
    title: 'Workout',
    type: 'workout',
    startTime: '05:20',
    endTime: '06:20',
    status: 'pending',
    instructions: 'Resistance band and bodyweight training. Maintain proper breathing, avoid neck strain',
  },
  {
    id: 'cooldown',
    title: 'Cool Down + Stretch',
    type: 'workout',
    startTime: '06:20',
    endTime: '06:30',
    status: 'pending',
    instructions: 'Stretch neck, shoulders, and upper back. Slow breathing',
  },
  {
    id: 'meditation',
    title: 'Meditation',
    type: 'meditation',
    startTime: '06:30',
    endTime: '06:40',
    status: 'pending',
    instructions: 'Breathing meditation using guided audio',
  },
  {
    id: 'sunlight',
    title: 'Sunlight Exposure',
    type: 'routine',
    startTime: '06:45',
    endTime: '07:00',
    status: 'pending',
    instructions: 'Get 10-15 minutes of sunlight exposure',
  },
  {
    id: 'study',
    title: 'Study Session (Deep Work)',
    type: 'study',
    startTime: '07:00',
    endTime: '08:15',
    status: 'pending',
    instructions: '2 × 30 min focus blocks with 5 min break. No phone, no distractions',
  },
  {
    id: 'breakfast',
    title: 'Breakfast + Coffee + Get Ready',
    type: 'routine',
    startTime: '08:15',
    endTime: '09:15',
    status: 'pending',
    instructions: 'Eat breakfast, have coffee, and get ready calmly without rushing',
  },
  {
    id: 'commute-morning',
    title: 'Commute to Office',
    type: 'travel',
    startTime: '09:30',
    endTime: '10:30',
    status: 'pending',
    instructions: 'Listen to educational audio or podcasts, or relax mind. Avoid random scrolling and stress thinking',
  },
  {
    id: 'office-work',
    title: 'Office Work (Focused Work)',
    type: 'work',
    startTime: '11:00',
    endTime: '16:00',
    status: 'pending',
    instructions: 'Work in 45–60 min blocks with 3–5 min breaks. Follow 20-20-20 rule and stretch neck every 1–2 hours',
  },
  {
    id: 'green-tea',
    title: 'Green Tea Break',
    type: 'routine',
    startTime: '11:30',
    endTime: '11:40',
    status: 'pending',
    instructions: 'Drink green tea and take a short refresh break',
  },
  {
    id: 'afternoon-reset',
    title: 'Afternoon Reset Break',
    type: 'recovery',
    startTime: '14:30',
    endTime: '15:00',
    status: 'pending',
    instructions: '2 min deep breathing and short walk if possible',
  },
  {
    id: 'commute-evening',
    title: 'Commute Back Home',
    type: 'travel',
    startTime: '16:00',
    endTime: '17:00',
    status: 'pending',
    instructions: 'Listen to calm music, light podcast, or stay silent. Avoid work thinking',
  },
  {
    id: 'evening-recovery',
    title: 'Evening Recovery',
    type: 'recovery',
    startTime: '17:15',
    endTime: '18:15',
    status: 'pending',
    instructions: '15–20 min walk, light stretching, optional shower',
  },
  {
    id: 'study-evening',
    title: 'Optional Study (Light)',
    type: 'study',
    startTime: '18:15',
    endTime: '19:00',
    status: 'pending',
    instructions: 'Light revision or practice. Skip if mentally tired',
  },
  {
    id: 'dinner',
    title: 'Dinner',
    type: 'routine',
    startTime: '19:00',
    endTime: '19:30',
    status: 'pending',
    instructions: 'Eat a light and balanced dinner',
  },
  {
    id: 'turmeric-latte',
    title: 'Turmeric Latte',
    type: 'routine',
    startTime: '19:45',
    endTime: '20:00',
    status: 'pending',
    instructions: 'Drink turmeric latte for recovery and relaxation',
  },
  {
    id: 'wind-down',
    title: 'No Screens + Wind Down',
    type: 'recovery',
    startTime: '20:30',
    endTime: '20:40',
    status: 'pending',
    instructions: 'Avoid screens and start winding down',
  },
  {
    id: 'chamomile-tea',
    title: 'Chamomile Tea',
    type: 'routine',
    startTime: '20:40',
    endTime: '20:45',
    status: 'pending',
    instructions: 'Drink chamomile tea for relaxation',
  },
  {
    id: 'body-scan',
    title: 'Body Scan Meditation',
    type: 'meditation',
    startTime: '20:45',
    endTime: '20:55',
    status: 'pending',
    instructions: 'Guided body scan meditation for deep relaxation',
  },
  {
    id: 'sleep',
    title: 'Sleep',
    type: 'sleep',
    startTime: '21:30',
    endTime: '05:00',
    status: 'pending',
    instructions: '7–8 hours of quality sleep',
  },
];

// Bump this whenever DEFAULT_ACTIVITIES changes so the app
// knows to merge updated defaults into today's schedule.
const SCHEDULE_VERSION = 2;

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function computeCompletion(activities: Activity[]): number {
  if (activities.length === 0) return 0;
  const done = activities.filter((a) => a.status === 'done').length;
  return Math.round((done / activities.length) * 100);
}

/**
 * Merge new default activities into an existing day's activities.
 * - Matched by id: preserves status, notes, checklist progress
 * - New defaults: added as pending
 * - User-added activities (not in defaults): kept as-is
 */
function mergeDefaults(existing: Activity[], defaults: Activity[]): Activity[] {
  const existingById = new Map(existing.map((a) => [a.id, a]));
  const defaultIds = new Set(defaults.map((a) => a.id));
  const merged: Activity[] = [];

  for (const def of defaults) {
    const prev = existingById.get(def.id);
    if (prev) {
      // Keep user progress (status, notes), take new schedule fields
      merged.push({
        ...def,
        status: prev.status,
        notes: prev.notes,
        checklist: def.checklist?.map((c, ci) => ({
          ...c,
          done: prev.checklist?.[ci]?.done ?? false,
        })),
      });
    } else {
      merged.push({ ...def, status: 'pending' as ActivityStatus });
    }
  }

  // Keep any user-added activities that aren't part of the defaults
  for (const act of existing) {
    if (!defaultIds.has(act.id)) {
      merged.push(act);
    }
  }

  merged.sort((a, b) => a.startTime.localeCompare(b.startTime));
  return merged;
}

interface ActivityStore {
  days: Record<string, DayLog>;
  settings: UserSettings;
  scheduleVersion: number;

  getTodayLog: () => DayLog;
  initToday: () => void;
  updateActivityStatus: (activityId: string, status: ActivityStatus) => void;
  updateActivityNotes: (activityId: string, notes: string) => void;
  toggleChecklist: (activityId: string, checklistId: string) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  addActivity: (activity: Activity) => void;
  removeActivity: (activityId: string) => void;
  markScheduleModified: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  importSchedule: (entries: ImportScheduleEntry[], mode: ImportMode) => void;
  exportSchedule: () => ImportScheduleEntry[];
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      days: {},
      scheduleVersion: 0,
      settings: {
        pomodoroWork: 25,
        pomodoroBreak: 5,
        checkpointInterval: 20,
        maxScheduleShift: 30,
        rewards: {
          rewardPerDay: 50,
          penaltyPerMiss: 20,
          currency: '₹',
        },
      },

      getTodayLog: () => {
        const key = getTodayKey();
        const state = get();
        if (!state.days[key]) {
          return {
            date: key,
            activities: DEFAULT_ACTIVITIES.map((a) => ({ ...a })),
            completionPercent: 0,
            scheduleModified: false,
          };
        }
        return state.days[key];
      },

      initToday: () => {
        const key = getTodayKey();
        set((state) => {
          const needsMigration = state.scheduleVersion < SCHEDULE_VERSION;
          const existingDay = state.days[key];

          if (existingDay && !needsMigration) return state;

          let activities: Activity[];
          if (existingDay) {
            // Day exists but defaults changed — merge preserving progress
            activities = mergeDefaults(existingDay.activities, DEFAULT_ACTIVITIES);
          } else {
            // Brand new day
            activities = DEFAULT_ACTIVITIES.map((a) => ({
              ...a,
              status: 'pending' as ActivityStatus,
              checklist: a.checklist?.map((c) => ({ ...c, done: false })),
            }));
          }

          return {
            scheduleVersion: SCHEDULE_VERSION,
            days: {
              ...state.days,
              [key]: {
                date: key,
                activities,
                completionPercent: computeCompletion(activities),
                scheduleModified: existingDay?.scheduleModified ?? false,
              },
            },
          };
        });
      },

      updateActivityStatus: (activityId, status) => {
        const key = getTodayKey();
        set((state) => {
          let day = state.days[key];
          // Auto-init day if not yet hydrated
          if (!day) {
            day = {
              date: key,
              activities: DEFAULT_ACTIVITIES.map((a) => ({
                ...a,
                status: 'pending' as ActivityStatus,
                checklist: a.checklist?.map((c) => ({ ...c, done: false })),
              })),
              completionPercent: 0,
              scheduleModified: false,
            };
          }
          const activities = day.activities.map((a) =>
            a.id === activityId ? { ...a, status, updatedAt: Date.now() } : a
          );
          return {
            days: {
              ...state.days,
              [key]: {
                ...day,
                activities,
                completionPercent: computeCompletion(activities),
              },
            },
          };
        });
      },

      updateActivityNotes: (activityId, notes) => {
        const key = getTodayKey();
        set((state) => {
          const day = state.days[key];
          if (!day) return state;
          return {
            days: {
              ...state.days,
              [key]: {
                ...day,
                activities: day.activities.map((a) =>
                  a.id === activityId ? { ...a, notes, updatedAt: Date.now() } : a
                ),
              },
            },
          };
        });
      },

      toggleChecklist: (activityId, checklistId) => {
        const key = getTodayKey();
        set((state) => {
          const day = state.days[key];
          if (!day) return state;
          return {
            days: {
              ...state.days,
              [key]: {
                ...day,
                activities: day.activities.map((a) =>
                  a.id === activityId
                    ? {
                        ...a,
                        updatedAt: Date.now(),
                        checklist: a.checklist?.map((c) =>
                          c.id === checklistId ? { ...c, done: !c.done } : c
                        ),
                      }
                    : a
                ),
              },
            },
          };
        });
      },

      updateActivity: (activityId, updates) => {
        const key = getTodayKey();
        set((state) => {
          const day = state.days[key];
          if (!day) return state;
          return {
            days: {
              ...state.days,
              [key]: {
                ...day,
                activities: day.activities.map((a) =>
                  a.id === activityId ? { ...a, ...updates, updatedAt: Date.now() } : a
                ),
              },
            },
          };
        });
      },

      addActivity: (activity) => {
        const key = getTodayKey();
        set((state) => {
          const day = state.days[key];
          if (!day) return state;
          return {
            days: {
              ...state.days,
              [key]: {
                ...day,
                activities: [...day.activities, activity].sort((a, b) =>
                  a.startTime.localeCompare(b.startTime)
                ),
              },
            },
          };
        });
      },

      removeActivity: (activityId) => {
        const key = getTodayKey();
        set((state) => {
          const day = state.days[key];
          if (!day) return state;
          const activities = day.activities.filter((a) => a.id !== activityId);
          return {
            days: {
              ...state.days,
              [key]: {
                ...day,
                activities,
                completionPercent: computeCompletion(activities),
              },
            },
          };
        });
      },

      markScheduleModified: () => {
        const key = getTodayKey();
        set((state) => {
          const day = state.days[key];
          if (!day) return state;
          return {
            days: {
              ...state.days,
              [key]: { ...day, scheduleModified: true },
            },
          };
        });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      importSchedule: (entries, mode) => {
        const key = getTodayKey();
        set((state) => {
          const day = state.days[key];
          if (!day) return state;

          let newActivities: Activity[];

          if (mode === 'replace') {
            newActivities = entries.map((e, i) => ({
              id: `import-${Date.now()}-${i}`,
              title: e.title,
              type: e.type,
              startTime: e.startTime,
              endTime: e.endTime,
              status: 'pending' as ActivityStatus,
              instructions: e.instructions,
              checklist: e.checklist?.map((c, ci) => ({
                id: `cl-${ci}`,
                label: c.label,
                done: false,
              })),
            }));
          } else {
            // Merge mode
            const existingByTitle = new Map<string, number>();
            day.activities.forEach((a, idx) => {
              existingByTitle.set(a.title.toLowerCase().trim(), idx);
            });

            newActivities = [...day.activities];

            for (const entry of entries) {
              const matchIdx = existingByTitle.get(entry.title.toLowerCase().trim());
              if (matchIdx !== undefined) {
                // Update matched activity in-place (preserve id, status, notes)
                const existing = newActivities[matchIdx];
                newActivities[matchIdx] = {
                  ...existing,
                  startTime: entry.startTime,
                  endTime: entry.endTime,
                  type: entry.type,
                  instructions: entry.instructions ?? existing.instructions,
                  checklist: entry.checklist
                    ? entry.checklist.map((c, ci) => ({
                        id: `cl-${ci}`,
                        label: c.label,
                        done: existing.checklist?.[ci]?.done ?? false,
                      }))
                    : existing.checklist,
                };
              } else {
                // Add new activity
                newActivities.push({
                  id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  title: entry.title,
                  type: entry.type,
                  startTime: entry.startTime,
                  endTime: entry.endTime,
                  status: 'pending' as ActivityStatus,
                  instructions: entry.instructions,
                  checklist: entry.checklist?.map((c, ci) => ({
                    id: `cl-${ci}`,
                    label: c.label,
                    done: false,
                  })),
                });
              }
            }
          }

          // Sort by startTime
          newActivities.sort((a, b) => a.startTime.localeCompare(b.startTime));

          return {
            days: {
              ...state.days,
              [key]: {
                ...day,
                activities: newActivities,
                completionPercent: computeCompletion(newActivities),
                scheduleModified: true,
              },
            },
          };
        });
      },

      exportSchedule: () => {
        const day = get().getTodayLog();
        return day.activities.map((a) => ({
          title: a.title,
          type: a.type,
          startTime: a.startTime,
          endTime: a.endTime,
          instructions: a.instructions,
          ...(a.checklist
            ? { checklist: a.checklist.map((c) => ({ label: c.label })) }
            : {}),
        }));
      },
    }),
    { name: 'focusflow-activities' }
  )
);
