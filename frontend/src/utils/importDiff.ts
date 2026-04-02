import type { Activity, ImportScheduleEntry, ImportDiff, ImportDiffItem, ImportMode } from '../types';

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export function computeImportDiff(
  existing: Activity[],
  incoming: ImportScheduleEntry[],
  mode: ImportMode
): ImportDiff {
  const updated: ImportDiffItem[] = [];
  const added: ImportDiffItem[] = [];
  const removed: ImportDiffItem[] = [];
  const unchanged: ImportDiffItem[] = [];

  const existingByTitle = new Map<string, Activity>();
  for (const a of existing) {
    existingByTitle.set(normalize(a.title), a);
  }

  const matchedTitles = new Set<string>();

  for (const entry of incoming) {
    const key = normalize(entry.title);
    const match = existingByTitle.get(key);

    if (match) {
      matchedTitles.add(key);

      // Detect field-level changes
      const changes: { field: string; from: string; to: string }[] = [];
      if (match.startTime !== entry.startTime) {
        changes.push({ field: 'startTime', from: match.startTime, to: entry.startTime });
      }
      if (match.endTime !== entry.endTime) {
        changes.push({ field: 'endTime', from: match.endTime, to: entry.endTime });
      }
      if (match.type !== entry.type) {
        changes.push({ field: 'type', from: match.type, to: entry.type });
      }
      if ((entry.instructions ?? '') !== (match.instructions ?? '')) {
        changes.push({
          field: 'instructions',
          from: match.instructions ?? '',
          to: entry.instructions ?? '',
        });
      }

      if (changes.length > 0) {
        updated.push({
          title: entry.title,
          type: entry.type,
          startTime: entry.startTime,
          endTime: entry.endTime,
          instructions: entry.instructions,
          changes,
        });
      } else {
        unchanged.push({
          title: match.title,
          type: match.type,
          startTime: match.startTime,
          endTime: match.endTime,
          instructions: match.instructions,
        });
      }
    } else {
      added.push({
        title: entry.title,
        type: entry.type,
        startTime: entry.startTime,
        endTime: entry.endTime,
        instructions: entry.instructions,
      });
    }
  }

  // In replace mode, existing activities not in the import are removed
  if (mode === 'replace') {
    for (const a of existing) {
      if (!matchedTitles.has(normalize(a.title))) {
        removed.push({
          title: a.title,
          type: a.type,
          startTime: a.startTime,
          endTime: a.endTime,
          instructions: a.instructions,
        });
      }
    }
  }

  return { updated, added, removed, unchanged };
}

export function validateImportJson(raw: string): { valid: true; data: ImportScheduleEntry[] } | { valid: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { valid: false, error: 'Invalid JSON syntax' };
  }

  if (!Array.isArray(parsed)) {
    return { valid: false, error: 'Expected a JSON array of activities' };
  }

  if (parsed.length === 0) {
    return { valid: false, error: 'Import array is empty' };
  }

  const timeRegex = /^\d{2}:\d{2}$/;
  const validTypes = ['workout', 'meditation', 'study', 'work', 'recovery', 'sleep', 'travel', 'routine', 'custom'];

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `Item ${i + 1}: not an object` };
    }
    if (typeof item.title !== 'string' || !item.title.trim()) {
      return { valid: false, error: `Item ${i + 1}: missing or empty "title"` };
    }
    if (!validTypes.includes(item.type)) {
      return { valid: false, error: `Item ${i + 1}: invalid "type" (${item.type})` };
    }
    if (!timeRegex.test(item.startTime)) {
      return { valid: false, error: `Item ${i + 1}: "startTime" must be HH:mm format` };
    }
    if (!timeRegex.test(item.endTime)) {
      return { valid: false, error: `Item ${i + 1}: "endTime" must be HH:mm format` };
    }
  }

  return { valid: true, data: parsed as ImportScheduleEntry[] };
}
