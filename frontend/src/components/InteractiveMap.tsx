'use client';

import { useMemo, useState } from 'react';
import { resolveImageUrl } from '@/lib/format';
import type { ImageDto } from '@/types/image';

export interface MapMarker {
  id: string;
  name: string;
  description?: string | null;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  image?: ImageDto | null;
  coverImage?: ImageDto | null;
}

function toPercent(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}

/** Flat marker map. Prefer {@link GeoMap} for multi-level Caucasus zooms. */
export function InteractiveMap({
  markers,
  className = '',
  dark = false,
}: {
  markers: MapMarker[];
  className?: string;
  dark?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const placed = useMemo(() => {
    const withCoords = markers.filter(
      (m) =>
        typeof m.latitude === 'number' &&
        typeof m.longitude === 'number' &&
        !Number.isNaN(m.latitude) &&
        !Number.isNaN(m.longitude),
    );
    if (withCoords.length === 0) return [];

    const lats = withCoords.map((m) => m.latitude as number);
    const lngs = withCoords.map((m) => m.longitude as number);
    const minLat = Math.min(...lats) - 0.05;
    const maxLat = Math.max(...lats) + 0.05;
    const minLng = Math.min(...lngs) - 0.05;
    const maxLng = Math.max(...lngs) + 0.05;

    return withCoords.map((m) => ({
      ...m,
      x: toPercent(m.longitude as number, minLng, maxLng),
      y: 100 - toPercent(m.latitude as number, minLat, maxLat),
    }));
  }, [markers]);

  const active = placed.find((m) => m.id === activeId) ?? null;

  return (
    <div
      className={`relative overflow-hidden rounded-card ${dark ? 'bg-[#0B1013] text-white' : 'bg-primary/5'} ${className}`}
    >
      <div className="relative min-h-[320px] w-full desktop:min-h-[420px]">
        {placed.length === 0 ? (
          <div className="flex h-full min-h-[320px] items-center justify-center px-6 text-center text-sm opacity-70">
            Выберите точки маршрута — они появятся на карте
          </div>
        ) : (
          placed.map((marker) => (
            <button
              key={marker.id}
              type="button"
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onClick={() =>
                setActiveId((id) => (id === marker.id ? null : marker.id))
              }
            >
              <span
                className={`relative block h-3.5 w-3.5 rounded-full border-2 ${dark ? 'border-accent bg-accent' : 'border-white bg-primary'}`}
              />
              <span className="mt-1 block max-w-[120px] truncate text-xs font-medium">
                {marker.name}
              </span>
            </button>
          ))
        )}

        {active ? (
          <div
            className={`absolute z-20 w-[260px] max-w-[85%] overflow-hidden rounded-2xl shadow-card ${dark ? 'border border-white/10 bg-[#132018]' : 'border border-border bg-surface'}`}
            style={{
              left: `min(max(${active.x}%, 20%), 70%)`,
              top: `min(max(${active.y - 8}%, 8%), 55%)`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(
                active.image?.url ?? active.coverImage?.url,
              )}
              alt={active.name}
              className="h-28 w-full object-cover"
            />
            <div className="p-3">
              <p className="font-semibold">{active.name}</p>
              <p className="mt-1 line-clamp-3 text-sm opacity-70">
                {active.description || 'Точка маршрута на Кавказе'}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
