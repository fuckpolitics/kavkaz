export type DaySlot =
  | { id: string; kind: 'location'; locationId: string }
  | { id: string; kind: 'rest' };

export function inclusiveDayCount(start: string, end: string): number {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) {
    return 1;
  }
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function newRestId() {
  return `rest-${Math.random().toString(36).slice(2, 9)}`;
}

/** Keep order, sync with selected locations and target day count. */
export function syncDaySlots(
  prev: DaySlot[],
  locationIds: string[],
  dayCount: number,
): DaySlot[] {
  const locationSet = new Set(locationIds);
  const merged: DaySlot[] = [];

  for (const slot of prev) {
    if (slot.kind === 'location' && locationSet.has(slot.locationId)) {
      merged.push(slot);
    } else if (slot.kind === 'rest') {
      merged.push(slot);
    }
  }

  for (const locationId of locationIds) {
    if (!merged.some((s) => s.kind === 'location' && s.locationId === locationId)) {
      merged.push({ id: `loc-${locationId}`, kind: 'location', locationId });
    }
  }

  const minDays = locationIds.length;
  const target = Math.max(dayCount, minDays);

  while (merged.length > target) {
    const restIdx = [...merged]
      .map((s, i) => (s.kind === 'rest' ? i : -1))
      .filter((i) => i >= 0)
      .pop();
    if (restIdx === undefined) break;
    merged.splice(restIdx, 1);
  }

  while (merged.length < target) {
    merged.push({ id: newRestId(), kind: 'rest' });
  }

  return merged;
}

export function reorderSlots(slots: DaySlot[], activeId: string, overId: string) {
  const oldIndex = slots.findIndex((s) => s.id === activeId);
  const newIndex = slots.findIndex((s) => s.id === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return slots;
  const next = [...slots];
  const [item] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, item);
  return next;
}
