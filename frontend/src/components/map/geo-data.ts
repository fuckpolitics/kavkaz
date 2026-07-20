import type { LocationShortDto } from '@/types/location';
import { resolveImageUrl } from '@/lib/format';

export interface GeoPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string | null;
  image?: string | null;
}

export interface GeoLocation extends GeoPoint {
  sublocations: GeoPoint[];
}

export interface GeoRegion {
  id: string;
  name: string;
  locations: GeoLocation[];
}

function hasCoords(l: {
  latitude?: number | null;
  longitude?: number | null;
}): boolean {
  return (
    typeof l.latitude === 'number' &&
    typeof l.longitude === 'number' &&
    !Number.isNaN(l.latitude) &&
    !Number.isNaN(l.longitude)
  );
}

/**
 * Build the region → location → sublocation tree the map consumes from flat
 * API data. Adding a new route later just means adding locations with
 * coordinates in the DB — no map code changes required.
 */
export function buildGeoRegions(
  destinations: { id: string; name: string }[],
  locations: LocationShortDto[],
): GeoRegion[] {
  const parents = locations.filter((l) => !l.parentId && hasCoords(l));
  const childrenByParent = new Map<string, LocationShortDto[]>();
  for (const loc of locations) {
    if (loc.parentId) {
      const arr = childrenByParent.get(loc.parentId) ?? [];
      arr.push(loc);
      childrenByParent.set(loc.parentId, arr);
    }
  }

  const geoLocationsByDest = new Map<string, GeoLocation[]>();
  for (const parent of parents) {
    const destId = (parent as { destinationId?: string }).destinationId;
    const subs = (childrenByParent.get(parent.id) ?? [])
      .filter(hasCoords)
      .map<GeoPoint>((s) => ({
        id: s.id,
        name: s.name,
        lat: s.latitude as number,
        lng: s.longitude as number,
        description: s.description,
        image: s.coverImage ? resolveImageUrl(s.coverImage.url) : null,
      }));

    const geoLoc: GeoLocation = {
      id: parent.id,
      name: parent.name,
      lat: parent.latitude as number,
      lng: parent.longitude as number,
      description: parent.description,
      image: parent.coverImage ? resolveImageUrl(parent.coverImage.url) : null,
      sublocations: subs,
    };

    if (!destId) continue;
    const arr = geoLocationsByDest.get(destId) ?? [];
    arr.push(geoLoc);
    geoLocationsByDest.set(destId, arr);
  }

  return destinations
    .map<GeoRegion>((d) => ({
      id: d.id,
      name: d.name,
      locations: geoLocationsByDest.get(d.id) ?? [],
    }))
    .filter((r) => r.locations.length > 0);
}
