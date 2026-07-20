import type { LocationShortDto } from '@/types/location';

export function getParentId(location: LocationShortDto): string {
  if (!location.parentId) return location.id;
  return location.parentId;
}

/** Ordered unique parent IDs for selected points (parents or sublocations). */
export function orderedParentIds(
  selectedIds: string[],
  locations: LocationShortDto[],
): string[] {
  const byId = new Map(locations.map((l) => [l.id, l]));
  const ordered: string[] = [];
  const seen = new Set<string>();

  for (const id of selectedIds) {
    const loc = byId.get(id);
    if (!loc) continue;
    const parentId = getParentId(loc);
    if (seen.has(parentId)) continue;
    seen.add(parentId);
    ordered.push(parentId);
  }
  return ordered;
}

export function selectedPointsForParent(
  parentId: string,
  selectedIds: Set<string>,
  locations: LocationShortDto[],
): LocationShortDto[] {
  return locations.filter(
    (loc) =>
      selectedIds.has(loc.id) &&
      (loc.id === parentId || loc.parentId === parentId),
  );
}

/**
 * Day time: round-trip from base + visit time on selected points of the parent.
 * Travel is taken from the parent location.
 */
export function estimateDayMinutes(
  parentId: string,
  selectedIds: Set<string>,
  locations: LocationShortDto[],
): number {
  const parent = locations.find((l) => l.id === parentId);
  const travelOneWay = parent?.travelFromBaseMinutes ?? 0;
  const points = selectedPointsForParent(parentId, selectedIds, locations);
  const visit = points.reduce(
    (sum, point) => sum + (point.visitDurationMinutes ?? 0),
    0,
  );
  const fallbackVisit = visit > 0 ? visit : 180;
  return travelOneWay * 2 + fallbackVisit;
}

export function estimateRouteMinutes(
  parentIds: string[],
  selectedIds: Set<string>,
  locations: LocationShortDto[],
): number {
  return parentIds.reduce(
    (sum, parentId) =>
      sum + estimateDayMinutes(parentId, selectedIds, locations),
    0,
  );
}

export function formatDurationMinutes(total: number): string {
  if (!total || total <= 0) return '—';
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes} мин`;
  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
}
