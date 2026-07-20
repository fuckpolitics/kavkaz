'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { destinationsApi } from '@/api/destinations.api';
import { locationsApi } from '@/api/locations.api';
import { ApiError } from '@/api/client';
import { ImageIdsPicker } from '@/components/admin/ImageIdsPicker';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppSelect } from '@/components/AppSelect';
import { AppTextarea } from '@/components/AppTextarea';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { resolveImageUrl } from '@/lib/format';
import type { DestinationShortDto } from '@/types/destination';
import type { ImageDto } from '@/types/image';
import type { LocationDto, LocationShortDto } from '@/types/location';

type FormState = {
  destinationId: string;
  parentId: string;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  visitDurationMinutes: string;
  travelFromBaseMinutes: string;
  images: ImageDto[];
};

const emptyForm = (destinationId = ''): FormState => ({
  destinationId,
  parentId: '',
  name: '',
  description: '',
  latitude: '43.3',
  longitude: '42.4',
  visitDurationMinutes: '60',
  travelFromBaseMinutes: '',
  images: [],
});

export default function AdminLocationsPage() {
  const [items, setItems] = useState<LocationShortDto[]>([]);
  const [destinations, setDestinations] = useState<DestinationShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const parents = useMemo(
    () =>
      items.filter(
        (item) =>
          !item.parentId && (!editingId || item.id !== editingId),
      ),
    [items, editingId],
  );

  const tree = useMemo(() => {
    const roots = items.filter((item) => !item.parentId);
    return roots.map((root) => ({
      root,
      children: items.filter((item) => item.parentId === root.id),
    }));
  }, [items]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [locs, dests] = await Promise.all([
        locationsApi.list({ limit: 100 }),
        destinationsApi.list({ limit: 100 }),
      ]);
      setItems(locs);
      setDestinations(dests);
      setForm((prev) =>
        prev.destinationId
          ? prev
          : emptyForm(dests[0]?.id ?? ''),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm(form.destinationId || destinations[0]?.id || ''));
  }

  async function startEdit(id: string) {
    setBusy(true);
    setError(null);
    try {
      const full: LocationDto = await locationsApi.get(id);
      setEditingId(id);
      setForm({
        destinationId: full.destinationId,
        parentId: full.parentId ?? '',
        name: full.name,
        description: full.description,
        latitude: String(full.latitude ?? ''),
        longitude: String(full.longitude ?? ''),
        visitDurationMinutes:
          full.visitDurationMinutes != null
            ? String(full.visitDurationMinutes)
            : '',
        travelFromBaseMinutes:
          full.travelFromBaseMinutes != null
            ? String(full.travelFromBaseMinutes)
            : '',
        images: full.images ?? [],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      destinationId: form.destinationId,
      parentId: form.parentId || null,
      name: form.name,
      description: form.description,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      visitDurationMinutes: form.visitDurationMinutes
        ? Number(form.visitDurationMinutes)
        : null,
      travelFromBaseMinutes: form.travelFromBaseMinutes
        ? Number(form.travelFromBaseMinutes)
        : null,
      imageIds: form.images.map((image) => image.id),
    };
    try {
      if (editingId) {
        await locationsApi.update(editingId, payload);
      } else {
        await locationsApi.create(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  }

  function startSublocation(parent: LocationShortDto) {
    setEditingId(null);
    setForm({
      ...emptyForm(parent.destinationId ?? form.destinationId),
      parentId: parent.id,
      latitude: String(parent.latitude ?? '43.3'),
      longitude: String(parent.longitude ?? '42.4'),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Локации</h1>
      <form
        onSubmit={onSubmit}
        className="mb-8 space-y-3 rounded-card border border-border bg-surface p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">
            {editingId ? 'Редактирование' : 'Новая точка'}
          </p>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-text-secondary underline"
            >
              Отменить
            </button>
          ) : null}
        </div>
        <AppSelect
          label="Направление"
          value={form.destinationId}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              destinationId: e.target.value,
              parentId: '',
            }))
          }
          options={destinations.map((d) => ({ value: d.id, label: d.name }))}
        />
        <AppSelect
          label="Родительская локация (для подлокации)"
          value={form.parentId}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, parentId: e.target.value }))
          }
          options={parents
            .filter((item) => item.destinationId === form.destinationId)
            .map((item) => ({ value: item.id, label: item.name }))}
          placeholder="Без родителя — обычная локация"
        />
        <AppInput
          label="Название"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <AppTextarea
          label="Описание"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <AppInput
            label="Широта"
            value={form.latitude}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, latitude: e.target.value }))
            }
            required
          />
          <AppInput
            label="Долгота"
            value={form.longitude}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, longitude: e.target.value }))
            }
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <AppInput
            label="Время на точке, мин"
            type="number"
            min={0}
            value={form.visitDurationMinutes}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                visitDurationMinutes: e.target.value,
              }))
            }
            placeholder="напр. 60"
          />
          <AppInput
            label="Дорога от базы, мин (в одну сторону)"
            type="number"
            min={0}
            value={form.travelFromBaseMinutes}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                travelFromBaseMinutes: e.target.value,
              }))
            }
            placeholder={
              form.parentId ? 'обычно только у локации' : 'напр. 120'
            }
          />
        </div>
        <p className="text-xs text-text-secondary">
          Для локации задайте дорогу от базы. Для подлокаций важнее время на
          точке — в конструкторе день считается как дорога×2 + сумма визитов.
        </p>
        <ImageIdsPicker
          images={form.images}
          onChange={(images) => setForm((prev) => ({ ...prev, images }))}
          disabled={busy}
        />
        <AppButton type="submit" loading={busy}>
          {editingId ? 'Сохранить' : 'Создать'}
        </AppButton>
      </form>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : tree.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {tree.map(({ root, children }) => (
            <div
              key={root.id}
              className="rounded-2xl border border-border bg-surface"
            >
              <LocationRow
                item={root}
                kind="локация"
                onEdit={() => void startEdit(root.id)}
                onAddChild={() => startSublocation(root)}
                onDelete={() => setDeleteId(root.id)}
              />
              {children.length > 0 ? (
                <div className="border-t border-border">
                  {children.map((child) => (
                    <LocationRow
                      key={child.id}
                      item={child}
                      kind="подлокация"
                      nested
                      onEdit={() => void startEdit(child.id)}
                      onDelete={() => setDeleteId(child.id)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Удалить локацию?"
        message="Действие выполнит soft-delete. Подлокации лучше удалить отдельно."
        loading={busy}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          setBusy(true);
          try {
            await locationsApi.remove(deleteId);
            setDeleteId(null);
            if (editingId === deleteId) resetForm();
            await load();
          } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Ошибка');
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

function LocationRow({
  item,
  kind,
  nested = false,
  onEdit,
  onAddChild,
  onDelete,
}: {
  item: LocationShortDto;
  kind: string;
  nested?: boolean;
  onEdit: () => void;
  onAddChild?: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${nested ? 'bg-black/[0.02] pl-8' : ''}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {item.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(item.coverImage.url)}
            alt=""
            className="h-12 w-16 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-black/5 text-xs text-text-secondary">
            нет фото
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-medium">{item.name}</p>
          <p className="text-xs text-text-secondary">
            {kind}
            {item.visitDurationMinutes != null
              ? ` · на месте ${item.visitDurationMinutes} мин`
              : ''}
            {item.travelFromBaseMinutes != null
              ? ` · дорога ${item.travelFromBaseMinutes} мин`
              : ''}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {onAddChild ? (
          <AppButton size="sm" variant="secondary" onClick={onAddChild}>
            + подлокация
          </AppButton>
        ) : null}
        <AppButton size="sm" variant="secondary" onClick={onEdit}>
          Изменить
        </AppButton>
        <AppButton size="sm" variant="danger" onClick={onDelete}>
          Удалить
        </AppButton>
      </div>
    </div>
  );
}
