import { useEffect, useRef, useCallback } from 'react';
import { useActivityStore } from '../store/activityStore';
import type { Activity } from '../types';

const FIVE_MINUTES = 5 * 60 * 1000;

function parseTimeToday(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function scheduleIfFuture(
  fn: () => void,
  fireAt: Date,
  now: number,
  timeouts: number[],
) {
  const delay = fireAt.getTime() - now;
  if (delay > 0) {
    timeouts.push(window.setTimeout(fn, delay));
  }
}

function sendNotification(title: string, body: string, tag: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/pwa-192.png', tag });
  }
}

export function useNotifications() {
  const timeoutsRef = useRef<number[]>([]);
  const permissionRequested = useRef(false);

  const activities = useActivityStore((s) => s.getTodayLog().activities);
  const notificationsEnabled = useActivityStore(
    (s) => s.settings.notificationsEnabled,
  );

  const clearAllTimeouts = useCallback(() => {
    for (const id of timeoutsRef.current) {
      window.clearTimeout(id);
    }
    timeoutsRef.current = [];
  }, []);

  // Request permission once
  useEffect(() => {
    if (
      notificationsEnabled &&
      !permissionRequested.current &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      permissionRequested.current = true;
      Notification.requestPermission();
    }
  }, [notificationsEnabled]);

  // Schedule notifications whenever activities or setting change
  useEffect(() => {
    clearAllTimeouts();

    if (
      !notificationsEnabled ||
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    const now = Date.now();
    const timeouts = timeoutsRef.current;

    for (const activity of activities) {
      if (activity.status === 'done' || activity.status === 'skipped') continue;

      const start = parseTimeToday(activity.startTime);
      const end = parseTimeToday(activity.endTime);
      const remind = new Date(start.getTime() - FIVE_MINUTES);

      // 5-min reminder (only for pending)
      if (activity.status === 'pending') {
        scheduleIfFuture(
          () =>
            sendNotification(
              '⏰ Upcoming',
              `${activity.title} starts in 5 minutes`,
              `remind-${activity.id}`,
            ),
          remind,
          now,
          timeouts,
        );

        // At start time
        scheduleIfFuture(
          () =>
            sendNotification(
              '🟢 Time to start',
              `Time for: ${activity.title}`,
              `start-${activity.id}`,
            ),
          start,
          now,
          timeouts,
        );
      }

      // At end time — nudge if not completed
      scheduleIfFuture(
        () => {
          const current = useActivityStore
            .getState()
            .getTodayLog()
            .activities.find((a: Activity) => a.id === activity.id);
          if (current && current.status !== 'done' && current.status !== 'skipped') {
            sendNotification(
              '⚠️ Check-in',
              `Did you complete ${activity.title}?`,
              `end-${activity.id}`,
            );
          }
        },
        end,
        now,
        timeouts,
      );
    }

    return clearAllTimeouts;
  }, [activities, notificationsEnabled, clearAllTimeouts]);
}
