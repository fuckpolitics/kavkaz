'use client';

import { useMemo } from 'react';
import { formatPrice } from '@/lib/format';
import type { ExtraServiceDto } from '@/types/extra-service';
import type { LocationShortDto } from '@/types/location';

function groupExtras(
  extras: ExtraServiceDto[],
  locations: LocationShortDto[],
) {
  const byId = new Map(locations.map((l) => [l.id, l]));
  const global: ExtraServiceDto[] = [];
  const byLocation = new Map<string, { title: string; items: ExtraServiceDto[] }>();

  for (const extra of extras) {
    if (!extra.locationId) {
      global.push(extra);
      continue;
    }
    const loc = byId.get(extra.locationId);
    const title = loc?.name ?? extra.locationName ?? 'Локация';
    const key = extra.locationId;
    const bucket = byLocation.get(key) ?? { title, items: [] };
    bucket.items.push(extra);
    byLocation.set(key, bucket);
  }

  return {
    global,
    localGroups: [...byLocation.values()].sort((a, b) =>
      a.title.localeCompare(b.title, 'ru'),
    ),
  };
}

function ExtraTile({
  extra,
  selected,
  onToggle,
}: {
  extra: ExtraServiceDto;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-[22px] border px-4 py-4 text-left transition ${
        selected
          ? 'border-accent bg-accent/15 shadow-[0_0_0_1px_rgba(217,200,163,0.35)]'
          : 'border-white/12 bg-white/[0.04] hover:border-white/25'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-white">{extra.name}</p>
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
            selected
              ? 'border-accent bg-accent text-ink'
              : 'border-white/30 text-transparent'
          }`}
        >
          ✓
        </span>
      </div>
      {extra.description ? (
        <p className="mt-2 text-xs leading-relaxed text-white/55">
          {extra.description}
        </p>
      ) : null}
      <p className="mt-3 text-sm font-semibold text-accent">
        {formatPrice(extra.price)}
      </p>
    </button>
  );
}

export function ExtrasPicker({
  extras,
  locations,
  selectedIds,
  onToggle,
}: {
  extras: ExtraServiceDto[];
  locations: LocationShortDto[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { global, localGroups } = useMemo(
    () => groupExtras(extras, locations),
    [extras, locations],
  );

  if (extras.length === 0) {
    return (
      <p className="text-sm text-white/55">
        Для выбранных точек пока нет дополнительных услуг.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {global.length > 0 ? (
        <section>
          <p className="font-script text-2xl text-accent">На всю поездку</p>
          <p className="mt-1 text-sm text-white/50">
            Услуги без привязки к конкретной точке
          </p>
          <div className="mt-4 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
            {global.map((extra) => (
              <ExtraTile
                key={extra.id}
                extra={extra}
                selected={selectedIds.has(extra.id)}
                onToggle={() => onToggle(extra.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {localGroups.map((group) => (
        <section key={group.title}>
          <p className="font-script text-2xl text-accent">{group.title}</p>
          <p className="mt-1 text-sm text-white/50">
            Доступно для выбранной локации или подлокации
          </p>
          <div className="mt-4 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
            {group.items.map((extra) => (
              <ExtraTile
                key={extra.id}
                extra={extra}
                selected={selectedIds.has(extra.id)}
                onToggle={() => onToggle(extra.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
