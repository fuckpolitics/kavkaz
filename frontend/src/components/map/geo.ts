export const MAP_SVG_W = 1000;
export const MAP_SVG_H = 620;

// Covers mountain routes + CMV base cities (Kislovodsk / Essentuki / Zheleznovodsk).
export const CAUCASUS_WORLD = {
  minLng: 40.5,
  maxLng: 46.5,
  minLat: 42.45,
  maxLat: 44.35,
};

export interface XY {
  x: number;
  y: number;
}

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function projectLatLng(lat: number, lng: number): XY {
  const { minLng, maxLng, minLat, maxLat } = CAUCASUS_WORLD;
  const x = ((lng - minLng) / (maxLng - minLng)) * MAP_SVG_W;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * MAP_SVG_H;
  return { x, y };
}

export const WORLD_VIEW: ViewBox = { x: 0, y: 0, w: MAP_SVG_W, h: MAP_SVG_H };
/** Max zoom-in (smaller = closer). */
export const MIN_VIEW_W = 140;
/** Max zoom-out — full Caucasus frame. */
export const MAX_VIEW_W = MAP_SVG_W;

export function frameViewBox(
  points: XY[],
  pad = 90,
  minSize = 260,
): ViewBox {
  if (points.length === 0) {
    return { ...WORLD_VIEW };
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  let minX = Math.min(...xs) - pad;
  let maxX = Math.max(...xs) + pad;
  let minY = Math.min(...ys) - pad;
  let maxY = Math.max(...ys) + pad;

  let w = Math.max(maxX - minX, minSize);
  let h = Math.max(maxY - minY, minSize * (MAP_SVG_H / MAP_SVG_W));

  const aspect = MAP_SVG_W / MAP_SVG_H;
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return clampViewBox({ x: cx - w / 2, y: cy - h / 2, w, h });
}

/** Keep the viewport inside the map artwork. */
export function clampViewBox(vb: ViewBox): ViewBox {
  const aspect = MAP_SVG_W / MAP_SVG_H;
  let w = Math.min(MAX_VIEW_W, Math.max(MIN_VIEW_W, vb.w));
  let h = w / aspect;
  if (h > MAP_SVG_H) {
    h = MAP_SVG_H;
    w = h * aspect;
  }
  const maxX = MAP_SVG_W - w;
  const maxY = MAP_SVG_H - h;
  const x = maxX <= 0 ? (MAP_SVG_W - w) / 2 : Math.min(Math.max(vb.x, 0), maxX);
  const y = maxY <= 0 ? (MAP_SVG_H - h) / 2 : Math.min(Math.max(vb.y, 0), maxY);
  return { x, y, w, h };
}

/** Zoom around a pivot (default: view center). factor < 1 zooms in. */
export function zoomViewBox(
  vb: ViewBox,
  factor: number,
  pivot?: XY,
): ViewBox {
  const cx = pivot?.x ?? vb.x + vb.w / 2;
  const cy = pivot?.y ?? vb.y + vb.h / 2;
  const w = vb.w * factor;
  const h = vb.h * factor;
  return clampViewBox({
    x: cx - w / 2,
    y: cy - h / 2,
    w,
    h,
  });
}

export function viewBoxToString(vb: ViewBox): string {
  return `${vb.x} ${vb.y} ${vb.w} ${vb.h}`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpViewBox(a: ViewBox, b: ViewBox, t: number): ViewBox {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t),
  };
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function worldToPercent(pos: XY, vb: ViewBox): { left: number; top: number } {
  return {
    left: ((pos.x - vb.x) / vb.w) * 100,
    top: ((pos.y - vb.y) / vb.h) * 100,
  };
}

/**
 * Deterministic non-overlapping layout for route/sublocation level.
 * Always lays out around the map center so framing stays predictable.
 */
export function layoutRoutePoints(
  count: number,
  center: XY = { x: MAP_SVG_W / 2, y: MAP_SVG_H / 2 },
): XY[] {
  if (count <= 0) return [];
  if (count === 1) return [{ ...center }];

  const spacing = 64;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const points: XY[] = [];

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const inRow = Math.min(cols, count - row * cols);
    const xOff = (col - (inRow - 1) / 2) * spacing;
    const yOff = (row - (rows - 1) / 2) * spacing * 0.9;
    const stagger = row % 2 === 1 ? spacing * 0.16 : 0;
    points.push({
      x: center.x + xOff + stagger,
      y: center.y + yOff,
    });
  }
  return points;
}

export type LabelSide = 'top' | 'bottom' | 'left' | 'right';

interface LabelBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

function labelBox(pos: XY, side: LabelSide, w = 100, h = 30): LabelBox {
  const gap = 16;
  switch (side) {
    case 'top':
      return { x: pos.x - w / 2, y: pos.y - h - gap, w, h };
    case 'bottom':
      return { x: pos.x - w / 2, y: pos.y + gap, w, h };
    case 'left':
      return { x: pos.x - w - gap, y: pos.y - h / 2, w, h };
    case 'right':
      return { x: pos.x + gap, y: pos.y - h / 2, w, h };
  }
}

function boxesOverlap(a: LabelBox, b: LabelBox, pad = 8): boolean {
  return !(
    a.x + a.w + pad < b.x ||
    b.x + b.w + pad < a.x ||
    a.y + a.h + pad < b.y ||
    b.y + b.h + pad < a.y
  );
}

/**
 * Greedy label placement: bottom → top → right → left, avoiding overlaps
 * so nearby markers get readable captions on different sides.
 */
export function assignLabelSides(points: XY[]): LabelSide[] {
  const result: LabelSide[] = points.map(() => 'bottom');
  if (points.length === 0) return result;

  const candidates: LabelSide[] = ['bottom', 'top', 'right', 'left'];
  const placed: LabelBox[] = [];
  const order = points
    .map((_, i) => i)
    .sort(
      (a, b) => points[a].x - points[b].x || points[a].y - points[b].y,
    );

  for (const i of order) {
    let chosen: LabelSide = 'bottom';
    for (const side of candidates) {
      const box = labelBox(points[i], side);
      if (!placed.some((p) => boxesOverlap(p, box))) {
        chosen = side;
        break;
      }
    }
    result[i] = chosen;
    placed.push(labelBox(points[i], chosen));
  }
  return result;
}
