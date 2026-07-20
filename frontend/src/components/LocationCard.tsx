import type { LocationShortDto } from '@/types/location';
import { resolveImageUrl } from '@/lib/format';

export function LocationCard({
  location,
  onRemove,
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
}: {
  location: LocationShortDto & { visitTime?: string | null };
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
}) {
  const image = resolveImageUrl(
    location.coverImage?.url,
    '/images/placeholder-destination.svg',
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={location.name}
        className="h-14 w-14 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{location.name}</p>
        {location.visitTime ? (
          <p className="text-xs text-text-secondary">{location.visitTime}</p>
        ) : null}
      </div>
      {(onMoveUp || onMoveDown || onRemove) && (
        <div className="flex gap-1">
          {onMoveUp ? (
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-sm text-text-secondary hover:bg-background disabled:opacity-40"
              onClick={onMoveUp}
              disabled={disableUp}
            >
              ↑
            </button>
          ) : null}
          {onMoveDown ? (
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-sm text-text-secondary hover:bg-background disabled:opacity-40"
              onClick={onMoveDown}
              disabled={disableDown}
            >
              ↓
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-sm text-danger hover:bg-danger/10"
              onClick={onRemove}
            >
              Удалить
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
