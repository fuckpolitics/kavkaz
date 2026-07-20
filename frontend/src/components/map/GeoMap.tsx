'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { resolveImageUrl } from '@/lib/format';
import {
  BASE_CITIES,
  type BaseCityId,
  getBaseCity,
} from './base-cities';
import { CaucasusRelief } from './CaucasusRelief';
import {
  assignLabelSides,
  frameViewBox,
  layoutRoutePoints,
  MAP_SVG_H,
  MAP_SVG_W,
  projectLatLng,
  worldToPercent,
  zoomViewBox,
  type LabelSide,
  type ViewBox,
  type XY,
} from './geo';
import type { GeoLocation, GeoRegion } from './geo-data';
import { useAnimatedViewBox } from './useAnimatedViewBox';

type Level = 'caucasus' | 'region' | 'route' | 'subs';

interface Marker {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  pos: XY;
  kind: 'location' | 'sublocation' | 'base';
  regionId?: string;
  parentName?: string;
  labelSide: LabelSide;
}

function labelLayoutClass(side: LabelSide): string {
  switch (side) {
    case 'top':
      return 'flex-col-reverse items-center';
    case 'bottom':
      return 'flex-col items-center';
    case 'left':
      return 'flex-row-reverse items-center';
    case 'right':
      return 'flex-row items-center';
  }
}

function collectTourSubs(regions: GeoRegion[]) {
  const items: Array<{
    sub: GeoLocation['sublocations'][number];
    parent: GeoLocation;
    regionId: string;
  }> = [];
  for (const region of regions) {
    for (const loc of region.locations) {
      for (const sub of loc.sublocations) {
        items.push({ sub, parent: loc, regionId: region.id });
      }
    }
  }
  return items;
}

export function GeoMap({
  regions,
  selectedIds,
  onToggle,
  baseCityId = null,
  onBaseCityChange,
  dark = false,
  className = '',
  allowedToggleIds = null,
  toggleKinds = ['location', 'sublocation'],
  variant = 'builder',
}: {
  regions: GeoRegion[];
  selectedIds: Set<string>;
  onToggle?: (id: string) => void;
  baseCityId?: BaseCityId | null;
  onBaseCityChange?: (id: BaseCityId) => void;
  dark?: boolean;
  className?: string;
  allowedToggleIds?: Set<string> | null;
  toggleKinds?: Array<'location' | 'sublocation'>;
  /** tour: open all sublocations, hide unselected from the map */
  variant?: 'builder' | 'tour';
}) {
  const hideUnselected = variant === 'tour';
  const [level, setLevel] = useState<Level>(
    variant === 'tour' ? 'subs' : 'caucasus',
  );
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const bootedTour = useRef(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const viewBoxRef = useRef<ViewBox>({
    x: 0,
    y: 0,
    w: MAP_SVG_W,
    h: MAP_SVG_H,
  });

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === activeRegionId) ?? null,
    [regions, activeRegionId],
  );
  const activeLocation = useMemo(
    () =>
      activeRegion?.locations.find((l) => l.id === activeLocationId) ?? null,
    [activeRegion, activeLocationId],
  );

  const allTourSubs = useMemo(() => collectTourSubs(regions), [regions]);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const baseCity = getBaseCity(baseCityId);
  const basePos = useMemo(
    () => (baseCity ? projectLatLng(baseCity.lat, baseCity.lng) : null),
    [baseCity],
  );

  // Open tour map on the sublocations board once data is ready.
  useEffect(() => {
    if (variant !== 'tour' || bootedTour.current) return;
    if (regions.length === 0) return;
    bootedTour.current = true;
    setLevel('subs');
    setActiveRegionId(null);
    setActiveLocationId(null);
  }, [variant, regions]);

  const markers = useMemo<Marker[]>(() => {
    let list: Omit<Marker, 'labelSide'>[] = [];

    if (level === 'caucasus') {
      for (const region of regions) {
        for (const loc of region.locations) {
          const active =
            isSelected(loc.id) ||
            loc.sublocations.some((s) => isSelected(s.id));
          if (!active) continue;
          list.push({
            id: loc.id,
            name: loc.name,
            description: loc.description,
            image: loc.image,
            pos: projectLatLng(loc.lat, loc.lng),
            kind: 'location',
            regionId: region.id,
          });
        }
      }
      if (baseCity && basePos) {
        list = [
          {
            id: baseCity.id,
            name: baseCity.name,
            description: baseCity.description,
            image: null,
            pos: basePos,
            kind: 'base',
          },
          ...list,
        ];
      }
    } else if (level === 'region' && activeRegion) {
      list = activeRegion.locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        description: loc.description,
        image: loc.image,
        pos: projectLatLng(loc.lat, loc.lng),
        kind: 'location' as const,
        regionId: activeRegion.id,
      }));
    } else if (level === 'subs') {
      const visible = hideUnselected
        ? allTourSubs.filter(({ sub }) => isSelected(sub.id))
        : allTourSubs;
      const positions = layoutRoutePoints(visible.length);
      list = visible.map(({ sub, parent, regionId }, i) => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        image: sub.image,
        pos: positions[i],
        kind: 'sublocation' as const,
        regionId,
        parentName: parent.name,
      }));
    } else if (level === 'route' && activeLocation) {
      const visible = hideUnselected
        ? activeLocation.sublocations.filter((s) => isSelected(s.id))
        : activeLocation.sublocations;
      const positions = layoutRoutePoints(visible.length);
      list = visible.map((sub, i) => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        image: sub.image,
        pos: positions[i],
        kind: 'sublocation' as const,
        regionId: activeRegionId ?? undefined,
        parentName: activeLocation.name,
      }));
    }

    const sides = assignLabelSides(list.map((m) => m.pos));
    return list.map((m, i) => ({ ...m, labelSide: sides[i] }));
  }, [
    level,
    regions,
    activeRegion,
    activeLocation,
    activeRegionId,
    isSelected,
    baseCity,
    basePos,
    allTourSubs,
    hideUnselected,
  ]);

  const targetViewBox = useMemo<ViewBox>(() => {
    if (level === 'caucasus') {
      const tourPts = markers
        .filter((m) => m.kind !== 'base')
        .map((m) => m.pos);
      const pts = [...tourPts];
      if (basePos) pts.push(basePos);
      if (pts.length === 0) {
        return { x: 0, y: 0, w: MAP_SVG_W, h: MAP_SVG_H };
      }
      return frameViewBox(pts, tourPts.length <= 2 ? 80 : 100, 220);
    }
    if (level === 'region' && activeRegion) {
      const selected = activeRegion.locations.filter(
        (l) =>
          isSelected(l.id) ||
          l.sublocations.some((s) => isSelected(s.id)),
      );
      const locs = selected.length > 0 ? selected : activeRegion.locations;
      const pts = locs.map((l) => projectLatLng(l.lat, l.lng));
      return frameViewBox(pts, 100, 240);
    }
    if ((level === 'route' || level === 'subs') && markers.length > 0) {
      // Points are laid out near map center — frame them snugly.
      const n = markers.length;
      const pad = 70 + Math.min(80, Math.ceil(Math.sqrt(n)) * 28);
      return frameViewBox(
        markers.map((m) => m.pos),
        pad,
        200,
      );
    }
    if (level === 'route' || level === 'subs') {
      return frameViewBox(
        [{ x: MAP_SVG_W / 2, y: MAP_SVG_H / 2 }],
        160,
        280,
      );
    }
    return { x: 0, y: 0, w: MAP_SVG_W, h: MAP_SVG_H };
  }, [level, activeRegion, markers, basePos, isSelected]);

  const placeMarkers = useCallback((vb: ViewBox) => {
    viewBoxRef.current = vb;
    const layer = layerRef.current;
    if (!layer) return;
    const nodes = layer.querySelectorAll<HTMLElement>('[data-marker-id]');
    nodes.forEach((node) => {
      const x = Number(node.dataset.x);
      const y = Number(node.dataset.y);
      if (Number.isNaN(x) || Number.isNaN(y)) return;
      const { left, top } = worldToPercent({ x, y }, vb);
      node.style.left = `${left}%`;
      node.style.top = `${top}%`;
    });
  }, []);

  const { getViewBox, setViewBox, cancel } = useAnimatedViewBox(
    svgRef,
    targetViewBox,
    420,
    placeMarkers,
  );

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origin: ViewBox;
  } | null>(null);
  const [panning, setPanning] = useState(false);

  const canToggle = useCallback(
    (id: string, kind: 'location' | 'sublocation') => {
      if (!toggleKinds.includes(kind)) return false;
      if (allowedToggleIds && !allowedToggleIds.has(id)) return false;
      return Boolean(onToggle);
    },
    [allowedToggleIds, onToggle, toggleKinds],
  );

  function applyZoom(factor: number, clientX?: number, clientY?: number) {
    cancel();
    const vb = getViewBox();
    const surface = surfaceRef.current;
    let pivot: XY | undefined;
    if (
      clientX != null &&
      clientY != null &&
      surface
    ) {
      const rect = surface.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        pivot = {
          x: vb.x + ((clientX - rect.left) / rect.width) * vb.w,
          y: vb.y + ((clientY - rect.top) / rect.height) * vb.h,
        };
      }
    }
    setViewBox(zoomViewBox(vb, factor, pivot));
  }

  function onMapPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-marker-id]') || target.closest('[data-zoom-ui]')) {
      return;
    }
    cancel();
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...getViewBox() },
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setPanning(true);
  }

  function onMapPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const worldDx = ((e.clientX - drag.startX) / rect.width) * drag.origin.w;
    const worldDy = ((e.clientY - drag.startY) / rect.height) * drag.origin.h;
    setViewBox({
      ...drag.origin,
      x: drag.origin.x - worldDx,
      y: drag.origin.y - worldDy,
    });
  }

  function endPan(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setPanning(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      applyZoom(factor, e.clientX, e.clientY);
    };
    el.addEventListener('wheel', onWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', onWheelNative);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    placeMarkers(viewBoxRef.current);
  }, [markers, placeMarkers]);

  useEffect(() => {
    if (activeRegionId && !regions.some((r) => r.id === activeRegionId)) {
      setLevel(variant === 'tour' ? 'subs' : 'caucasus');
      setActiveRegionId(null);
      setActiveLocationId(null);
    }
  }, [regions, activeRegionId, variant]);

  function enterRegion(regionId: string) {
    setActiveRegionId(regionId);
    setActiveLocationId(null);
    setLevel('region');
  }

  function enterRoute(locationId: string) {
    setActiveLocationId(locationId);
    setLevel('route');
  }

  function handleMarkerClick(marker: Marker) {
    if (marker.kind === 'base') return;
    if (marker.kind === 'location') {
      if (marker.regionId && activeRegionId !== marker.regionId) {
        setActiveRegionId(marker.regionId);
      }
      if (level === 'caucasus') {
        if (marker.regionId) enterRegion(marker.regionId);
        return;
      }
      if (level === 'region') {
        enterRoute(marker.id);
        return;
      }
      if (canToggle(marker.id, 'location')) onToggle?.(marker.id);
      return;
    }
    if (canToggle(marker.id, 'sublocation')) onToggle?.(marker.id);
  }

  const hoverMarker = markers.find((m) => m.id === hoverId) ?? null;
  const tooltipStyle = useMemo((): CSSProperties | undefined => {
    if (!hoverMarker) return undefined;
    const { left, top } = worldToPercent(hoverMarker.pos, viewBoxRef.current);
    return {
      left: `${Math.min(Math.max(left, 14), 86)}%`,
      top: `${Math.min(Math.max(top, 16), 88)}%`,
    };
  }, [hoverMarker, markers, level]);

  const tourMarkers = markers.filter((m) => m.kind !== 'base');
  const linkPoints = tourMarkers.map((m) => `${m.pos.x},${m.pos.y}`).join(' ');
  const raysFromBase =
    basePos && level === 'caucasus'
      ? tourMarkers
          .map((m) => `M${basePos.x} ${basePos.y} L${m.pos.x} ${m.pos.y}`)
          .join(' ')
      : '';
  const accent = dark ? '#D9C8A3' : '#1E3D2F';

  const chipSubs =
    level === 'subs' || (variant === 'tour' && level !== 'region')
      ? allTourSubs
      : level === 'route' && activeLocation
        ? activeLocation.sublocations.map((sub) => ({
            sub,
            parent: activeLocation,
            regionId: activeRegionId ?? '',
          }))
        : [];

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center gap-1 text-sm">
        <button
          type="button"
          onClick={() => {
            if (variant === 'tour') {
              setLevel('subs');
              setActiveRegionId(null);
              setActiveLocationId(null);
            } else {
              setLevel('caucasus');
              setActiveRegionId(null);
              setActiveLocationId(null);
            }
          }}
          className={`rounded-btn px-2 py-1 ${
            level === 'caucasus' || level === 'subs'
              ? 'font-semibold'
              : 'opacity-70 hover:opacity-100'
          }`}
        >
          {variant === 'tour' ? 'Подлокации' : 'Маршрут'}
        </button>
        {activeRegion && level !== 'subs' ? (
          <>
            <span className="opacity-40">/</span>
            <button
              type="button"
              onClick={() => {
                setLevel('region');
                setActiveLocationId(null);
              }}
              className={`rounded-btn px-2 py-1 ${level === 'region' ? 'font-semibold' : 'opacity-70 hover:opacity-100'}`}
            >
              {activeRegion.name}
            </button>
          </>
        ) : null}
        {activeLocation && level === 'route' ? (
          <>
            <span className="opacity-40">/</span>
            <span className="rounded-btn px-2 py-1 font-semibold">
              {activeLocation.name}
            </span>
          </>
        ) : null}
      </div>

      <div
        ref={surfaceRef}
        className={`relative touch-none overflow-hidden rounded-card select-none ${
          panning ? 'cursor-grabbing' : 'cursor-grab'
        } ${dark ? 'bg-[#0B1013] text-white' : 'bg-[#e8efe9] text-primary'}`}
        onPointerDown={onMapPointerDown}
        onPointerMove={onMapPointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <div
          data-zoom-ui
          className="absolute bottom-3 right-3 z-30 flex flex-col gap-1"
        >
          <button
            type="button"
            aria-label="Приблизить"
            className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold shadow-soft ${
              dark
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-white text-forest hover:bg-cream'
            }`}
            onClick={() => applyZoom(1 / 1.25)}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Отдалить"
            className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold shadow-soft ${
              dark
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-white text-forest hover:bg-cream'
            }`}
            onClick={() => applyZoom(1.25)}
          >
            −
          </button>
        </div>
        <p
          className={`pointer-events-none absolute left-3 top-3 z-30 rounded-full px-2.5 py-1 text-[11px] backdrop-blur ${
            dark ? 'bg-black/40 text-white/70' : 'bg-white/80 text-text-secondary'
          }`}
        >
          Перетащите · колёсико для зума
        </p>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_SVG_W} ${MAP_SVG_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-[360px] w-full desktop:h-[460px]"
        >
          <CaucasusRelief dark={dark} />
          {raysFromBase ? (
            <path
              d={raysFromBase}
              fill="none"
              stroke={accent}
              strokeOpacity={0.28}
              strokeWidth={1.2}
              strokeDasharray="4 8"
            />
          ) : null}
          {tourMarkers.length > 1 ? (
            <polyline
              points={linkPoints}
              fill="none"
              stroke={accent}
              strokeOpacity={0.4}
              strokeWidth={1.4}
              strokeDasharray="5 9"
            />
          ) : null}
        </svg>

        <div ref={layerRef} className="pointer-events-none absolute inset-0">
          {markers.map((marker) => {
            const isBase = marker.kind === 'base';
            const on = isBase
              ? true
              : marker.kind === 'location'
                ? isSelected(marker.id) ||
                  locHasSelectedSub(regions, marker.id, isSelected)
                : isSelected(marker.id);
            const layout = labelLayoutClass(marker.labelSide);
            const commonClass = `absolute flex -translate-x-1/2 -translate-y-1/2 gap-1.5 ${layout} ${isBase ? 'z-20' : 'z-10'}`;

            const dot = (
              <span
                className={`relative flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${
                  isBase
                    ? 'marker-pulse bg-[#D9C8A3] shadow-[0_0_14px_rgba(217,200,163,0.75)] ring-2 ring-[#F2EFE8]/80'
                    : on
                      ? 'bg-[#F2EFE8] shadow-[0_0_10px_rgba(242,239,232,0.55)]'
                      : dark
                        ? 'bg-[#0B1013] ring-1 ring-[#D9C8A3]'
                        : 'bg-white ring-1 ring-primary'
                }`}
              >
                {isBase ? (
                  <span className="block h-1.5 w-1.5 rounded-sm bg-[#0B1013]" />
                ) : null}
              </span>
            );

            const label = (
              <span
                className={`max-w-[150px] truncate rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none backdrop-blur-sm ${
                  isBase
                    ? 'border border-[#D9C8A3]/60 bg-[#1E3D2F] text-[#F2EFE8]'
                    : on
                      ? dark
                        ? 'border border-[#D9C8A3]/50 bg-[#1E3D2F] text-[#F2EFE8]'
                        : 'border border-forest/30 bg-white text-forest'
                      : dark
                        ? 'border border-white/10 bg-[#0B1013]/85 text-[#F2EFE8]/70'
                        : 'border border-border bg-white/90 text-text-secondary'
                }`}
              >
                {isBase ? `База · ${marker.name}` : marker.name}
              </span>
            );

            if (isBase) {
              return (
                <div
                  key={marker.id}
                  data-marker-id={marker.id}
                  data-x={marker.pos.x}
                  data-y={marker.pos.y}
                  className={`${commonClass} pointer-events-auto`}
                  style={{ left: '50%', top: '50%' }}
                  onMouseEnter={() => setHoverId(marker.id)}
                  onMouseLeave={() =>
                    setHoverId((id) => (id === marker.id ? null : id))
                  }
                >
                  {dot}
                  {label}
                </div>
              );
            }

            return (
              <button
                key={marker.id}
                type="button"
                data-marker-id={marker.id}
                data-x={marker.pos.x}
                data-y={marker.pos.y}
                className={`${commonClass} pointer-events-auto`}
                style={{ left: '50%', top: '50%' }}
                onMouseEnter={() => setHoverId(marker.id)}
                onMouseLeave={() =>
                  setHoverId((id) => (id === marker.id ? null : id))
                }
                onClick={() => handleMarkerClick(marker)}
              >
                {dot}
                {label}
              </button>
            );
          })}
        </div>

        {hoverMarker && tooltipStyle ? (
          <div
            className="pointer-events-none absolute z-20 w-56 -translate-x-1/2 -translate-y-[118%]"
            style={tooltipStyle}
          >
            <div
              className={`overflow-hidden rounded-2xl shadow-card ${dark ? 'border border-white/10 bg-[#132018] text-white' : 'border border-border bg-surface text-text-primary'}`}
            >
              {hoverMarker.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(hoverMarker.image)}
                  alt={hoverMarker.name}
                  className="h-24 w-full object-cover"
                />
              ) : null}
              <div className="p-2.5">
                <p className="text-sm font-semibold leading-tight">
                  {hoverMarker.name}
                </p>
                {hoverMarker.parentName ? (
                  <p className="mt-0.5 text-[11px] opacity-60">
                    {hoverMarker.parentName}
                  </p>
                ) : null}
                {hoverMarker.description ? (
                  <p
                    className={`mt-1 line-clamp-3 text-xs ${dark ? 'text-white/70' : 'text-text-secondary'}`}
                  >
                    {hoverMarker.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {tourMarkers.length === 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 px-6 text-center text-sm text-white/70">
            {level === 'subs' || level === 'route'
              ? 'Включите подлокации кнопками ниже — они появятся на карте'
              : 'Выберите базу и регионы — точки маршрута появятся на карте'}
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {level !== 'route' && level !== 'subs' ? (
          <div>
            <p
              className={`mb-2 text-sm ${dark ? 'text-white/60' : 'text-text-secondary'}`}
            >
              Базовый город (ночёвки и выезд на экскурсии)
            </p>
            <div className="flex flex-wrap gap-2">
              {BASE_CITIES.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => onBaseCityChange?.(city.id)}
                  className={`rounded-btn px-4 py-2 text-sm transition ${
                    baseCityId === city.id
                      ? dark
                        ? 'bg-[#D9C8A3] text-[#0B1013]'
                        : 'bg-primary text-white'
                      : dark
                        ? 'border border-[#D9C8A3]/35 text-[#D9C8A3] hover:bg-white/10'
                        : 'border border-border bg-surface text-text-secondary'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {level === 'caucasus' ? (
          <div>
            <p
              className={`mb-2 text-sm ${dark ? 'text-white/60' : 'text-text-secondary'}`}
            >
              Регионы маршрута
            </p>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => {
                const selectedCount = region.locations.filter(
                  (loc) =>
                    isSelected(loc.id) ||
                    loc.sublocations.some((s) => isSelected(s.id)),
                ).length;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => enterRegion(region.id)}
                    className={`rounded-btn px-4 py-2 text-sm transition ${
                      selectedCount > 0
                        ? dark
                          ? 'bg-[#1E3D2F] text-white'
                          : 'bg-primary text-white'
                        : dark
                          ? 'bg-white/10 text-white/80 hover:bg-white/15'
                          : 'border border-border bg-surface text-text-secondary'
                    }`}
                  >
                    {region.name}
                    {selectedCount > 0 ? ` · ${selectedCount}` : ''}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {level === 'region' && activeRegion ? (
          <div className="flex flex-wrap gap-2">
            {activeRegion.locations.map((loc) => (
              <LocationButton
                key={loc.id}
                loc={loc}
                on={
                  isSelected(loc.id) ||
                  loc.sublocations.some((s) => isSelected(s.id))
                }
                dark={dark}
                canToggle={canToggle(loc.id, 'location')}
                onToggle={() => {
                  if (canToggle(loc.id, 'location')) onToggle?.(loc.id);
                }}
                onOpen={() => enterRoute(loc.id)}
              />
            ))}
          </div>
        ) : null}

        {chipSubs.length > 0 ? (
          <div>
            <p
              className={`mb-2 text-sm ${dark ? 'text-white/60' : 'text-text-secondary'}`}
            >
              Подлокации тура
            </p>
            <div className="flex flex-wrap gap-2">
              {chipSubs.map(({ sub, parent }) => {
                const enabled = canToggle(sub.id, 'sublocation');
                return (
                  <button
                    key={sub.id}
                    type="button"
                    disabled={!enabled}
                    onClick={() => {
                      if (enabled) onToggle?.(sub.id);
                    }}
                    className={`rounded-btn px-3 py-1.5 text-xs transition ${
                      !enabled
                        ? 'cursor-not-allowed opacity-40'
                        : isSelected(sub.id)
                          ? dark
                            ? 'bg-[#D9C8A3] text-[#0B1013]'
                            : 'bg-primary text-white'
                          : dark
                            ? 'border border-white/15 text-white/70 hover:bg-white/10'
                            : 'border border-border text-text-secondary'
                    }`}
                    title={parent.name}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {variant === 'tour' && level === 'subs' && onBaseCityChange ? (
          <div>
            <p
              className={`mb-2 text-sm ${dark ? 'text-white/60' : 'text-text-secondary'}`}
            >
              Базовый город
            </p>
            <div className="flex flex-wrap gap-2">
              {BASE_CITIES.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => onBaseCityChange(city.id)}
                  className={`rounded-btn px-4 py-2 text-sm transition ${
                    baseCityId === city.id
                      ? 'bg-primary text-white'
                      : 'border border-border bg-surface text-text-secondary'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function locHasSelectedSub(
  regions: GeoRegion[],
  locationId: string,
  isSelected: (id: string) => boolean,
): boolean {
  for (const region of regions) {
    const loc = region.locations.find((l) => l.id === locationId);
    if (loc?.sublocations.some((s) => isSelected(s.id))) return true;
  }
  return false;
}

function LocationButton({
  loc,
  on,
  dark,
  canToggle,
  onToggle,
  onOpen,
}: {
  loc: GeoLocation;
  on: boolean;
  dark: boolean;
  canToggle: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <span
      className={`inline-flex items-center overflow-hidden rounded-btn text-sm ${
        on
          ? dark
            ? 'bg-[#1E3D2F] text-white'
            : 'bg-primary text-white'
          : dark
            ? 'border border-white/20 text-white/75'
            : 'border border-border text-text-secondary'
      }`}
    >
      <button
        type="button"
        onClick={canToggle ? onToggle : onOpen}
        className="px-3 py-2"
        title={canToggle ? 'Включить / выключить' : 'Открыть подлокации'}
      >
        {loc.name}
      </button>
      {loc.sublocations.length > 0 ? (
        <button
          type="button"
          onClick={onOpen}
          title="Открыть подлокации"
          className={`h-full px-2.5 py-2 text-xs ${dark ? 'bg-black/25' : 'bg-black/5'}`}
        >
          ▸
        </button>
      ) : null}
    </span>
  );
}
