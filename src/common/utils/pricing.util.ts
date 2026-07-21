import { toNumber } from './money.util';

/** Max group size from product rules (locations_prices.md). */
export const MAX_GROUP_SEATS = 8;

export type PricedLocation = {
  id: string;
  parentId?: string | null;
  price?: string | number | null;
};

export type PricedTripDay = {
  isRest?: boolean;
  locations?: Array<{ location?: PricedLocation | null }>;
};

/** Paying seats = adults + children (each seat is billed). At least 1. */
export function payingSeats(adults: number, children = 0): number {
  const seats = Math.max(0, Math.floor(adults)) + Math.max(0, Math.floor(children));
  return Math.max(1, seats);
}

/**
 * Seat price for one program day: sum of unique parent location day-trip prices.
 * Rest days = 0. Sublocations inherit parent price (counted once per parent).
 */
export function daySeatPrice(
  day: PricedTripDay,
  locationById: Map<string, PricedLocation>,
): number {
  if (day.isRest) return 0;
  const seenParents = new Set<string>();
  let sum = 0;
  for (const item of day.locations ?? []) {
    const loc = item.location;
    if (!loc) continue;
    const parentId = loc.parentId ?? loc.id;
    if (seenParents.has(parentId)) continue;
    seenParents.add(parentId);
    const parent = locationById.get(parentId) ?? (!loc.parentId ? loc : null);
    sum += toNumber(parent?.price);
  }
  return sum;
}

export function sumDaySeatPrices(
  days: PricedTripDay[],
  locationById: Map<string, PricedLocation>,
): number {
  return days.reduce((sum, day) => sum + daySeatPrice(day, locationById), 0);
}

export function estimateTripTotal(input: {
  adults: number;
  children?: number;
  /** Per-seat base for tour-sourced trips */
  tourSeatPrice?: number | string | null;
  /** Custom program days (ignored when tourSeatPrice is set and > 0 path uses tour) */
  days?: PricedTripDay[];
  locationById?: Map<string, PricedLocation>;
  useTourBase?: boolean;
  extras?: Array<{ price: number | string; quantity?: number }>;
}): {
  seats: number;
  seatUnitTotal: number;
  programTotal: number;
  extrasTotal: number;
  total: number;
} {
  const seats = payingSeats(input.adults, input.children ?? 0);
  let seatUnitTotal = 0;
  if (input.useTourBase) {
    seatUnitTotal = toNumber(input.tourSeatPrice);
  } else {
    seatUnitTotal = sumDaySeatPrices(
      input.days ?? [],
      input.locationById ?? new Map(),
    );
  }
  const programTotal = seatUnitTotal * seats;
  const extrasTotal = (input.extras ?? []).reduce((sum, item) => {
    return sum + toNumber(item.price) * Math.max(1, item.quantity ?? 1);
  }, 0);
  return {
    seats,
    seatUnitTotal,
    programTotal,
    extrasTotal,
    total: programTotal + extrasTotal,
  };
}
