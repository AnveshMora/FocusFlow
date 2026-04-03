/**
 * Utility to schedule notifications via the Service Worker.
 * SW notifications fire even when the page is backgrounded.
 */

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  fireAt: number;
}

function postToSW(message: unknown) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

/** Schedule a batch of activity notifications (replaces any previous batch) */
export function scheduleActivityNotifications(
  notifications: ScheduledNotification[],
) {
  postToSW({ type: 'SCHEDULE_NOTIFICATIONS', notifications });
}

/** Schedule a single timer completion notification */
export function scheduleTimerNotification(
  id: string,
  title: string,
  body: string,
  fireAt: number,
) {
  postToSW({
    type: 'SCHEDULE_TIMER_NOTIFICATION',
    id,
    notification: { id, title, body, fireAt },
  });
}

/** Cancel a specific timer notification */
export function cancelTimerNotification(id: string) {
  postToSW({ type: 'CANCEL_TIMER_NOTIFICATION', id });
}

/** Cancel all scheduled notifications */
export function cancelAllNotifications() {
  postToSW({ type: 'CANCEL_ALL_NOTIFICATIONS' });
}
