import type { DaySlot } from '@/lib/day-plan';
import type { LocationShortDto } from '@/types/location';

/** Max group size (locations_prices.md). */
export const MAX_GROUP_SEATS = 8;

export function payingSeats(adults: number, children = 0): number {
  const seats =
    Math.max(0, Math.floor(adults)) + Math.max(0, Math.floor(children));
  return Math.max(1, seats);
}

/** Day-trip seat price for a parent location (₽ / место). */
export function locationSeatPrice(
  locationId: string,
  locations: LocationShortDto[],
): number {
  const byId = new Map(locations.map((l) => [l.id, l]));
  const loc = byId.get(locationId);
  if (!loc) return 0;
  const parent = loc.parentId ? byId.get(loc.parentId) : loc;
  return parent?.price ?? loc.price ?? 0;
}

export function estimateBuilderTotal(input: {
  daySlots: DaySlot[];
  locations: LocationShortDto[];
  adults: number;
  children: number;
  extrasTotal: number;
}): {
  seats: number;
  seatUnitTotal: number;
  programTotal: number;
  extrasTotal: number;
  total: number;
  unpricedDays: number;
} {
  const seats = payingSeats(input.adults, input.children);
  let seatUnitTotal = 0;
  let unpricedDays = 0;
  for (const slot of input.daySlots) {
    if (slot.kind !== 'location') continue;
    const price = locationSeatPrice(slot.locationId, input.locations);
    if (price <= 0) unpricedDays += 1;
    else seatUnitTotal += price;
  }
  const programTotal = seatUnitTotal * seats;
  return {
    seats,
    seatUnitTotal,
    programTotal,
    extrasTotal: input.extrasTotal,
    total: programTotal + input.extrasTotal,
    unpricedDays,
  };
}
