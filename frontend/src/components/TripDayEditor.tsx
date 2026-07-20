'use client';

import { useState } from 'react';
import type { TripDayDto } from '@/types/trip';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';
import { AppTextarea } from './AppTextarea';
import { LocationCard } from './LocationCard';

export function TripDayEditor({
  day,
  isFirst,
  isLast,
  busy,
  onSave,
  onDelete,
  onAddLocation,
  onRemoveLocation,
  onReorderLocation,
}: {
  day: TripDayDto;
  isFirst: boolean;
  isLast: boolean;
  busy?: boolean;
  onSave: (data: { title: string; description: string | null }) => Promise<void>;
  onDelete: () => Promise<void>;
  onAddLocation: () => void;
  onRemoveLocation: (id: string) => Promise<void>;
  onReorderLocation: (id: string, newOrder: number) => Promise<void>;
}) {
  const [title, setTitle] = useState(day.title);
  const [description, setDescription] = useState(day.description ?? '');
  const [saving, setSaving] = useState(false);

  return (
    <article className="rounded-card border border-border bg-surface p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">День {day.dayNumber}</h3>
        <AppButton
          size="sm"
          variant="danger"
          disabled={busy || saving}
          onClick={() => void onDelete()}
        >
          Удалить день
        </AppButton>
      </div>

      <div className="space-y-3">
        <AppInput
          label="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <AppTextarea
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <AppButton
          size="sm"
          loading={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({
                title,
                description: description || null,
              });
            } finally {
              setSaving(false);
            }
          }}
        >
          Сохранить день
        </AppButton>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Локации</h4>
          <AppButton size="sm" variant="secondary" onClick={onAddLocation}>
            Добавить локацию
          </AppButton>
        </div>
        {day.locations.length === 0 ? (
          <p className="text-sm text-text-secondary">Локаций пока нет</p>
        ) : (
          day.locations
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((loc, index, arr) => (
              <LocationCard
                key={loc.id}
                location={{ ...loc.location, visitTime: loc.visitTime }}
                disableUp={index === 0}
                disableDown={index === arr.length - 1}
                onMoveUp={() =>
                  void onReorderLocation(loc.id, Math.max(0, loc.order - 1))
                }
                onMoveDown={() => void onReorderLocation(loc.id, loc.order + 1)}
                onRemove={() => void onRemoveLocation(loc.id)}
              />
            ))
        )}
      </div>
      {/* silence unused props for future day reorder UI */}
      <span className="sr-only">
        {String(isFirst)}
        {String(isLast)}
      </span>
    </article>
  );
}
