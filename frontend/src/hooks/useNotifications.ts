import { useEffect, useRef } from 'react';
import { useActivityStore } from '../store/activityStore';
import { scheduleActivityNotifications } from '../services/swNotifications';

const FIVE_MINUTES = 5 * 60 * 1000;

function parseTimeToday(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export function useNotifications() {
  const permissionRequested = useRef(false);

  const activities = useActivityStore((s) => s.getTodayLog().activities);
  const notificationsEnabled = useActivityStore(
    (s) => s.settings.notificationsEnabled,
  );

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

  // Build notification schedule and send to Service Worker
  useEffect(() => {
    if (
      !notificationsEnabled ||
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    ) {
      scheduleActivityNotifications([]);
      return;
    }

    const now = Date.now();
    const notifications: { id: string; title: string; body: string; fireAt: number }[] = [];

    for (const activity of activities) {
      if (activity.status === 'done' || activity.status === 'skipped') continue;

      const startMs = parseTimeToday(activity.startTime);
      const endMs = parseTimeToday(activity.endTime);
      const remindMs = startMs - FIVE_MINUTES;

      // 5-min reminder
      if (activity.status === 'pending' && remindMs > now) {
        notifications.push({
          id: `remind-${activity.id}`,
          title: '⏰ Upcoming',
          body: `${activity.title} starts in 5 minutes`,
          fireAt: remindMs,
        });
      }

      // At start time
      if (activity.status === 'pending' && startMs > now) {
        notifications.push({
          id: `start-${activity.id}`,
          title: '🟢 Time to start',
          body: `Time for: ${activity.title}`,
          fireAt: startMs,
        });
      }

      // At end time — check-in nudge
      if (endMs > now) {
        notifications.push({
          id: `end-${activity.id}`,
          title: '⚠️ Check-in',
          body: `Did you complete ${activity.title}?`,
          fireAt: endMs,
        });
      }
    }

    scheduleActivityNotifications(notifications);
  }, [activities, notificationsEnabled]);
}
