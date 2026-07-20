'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { extraServicesApi } from '@/api/extra-services.api';
import { locationsApi } from '@/api/locations.api';
import { ApiError } from '@/api/client';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppSelect } from '@/components/AppSelect';
import { AppTextarea } from '@/components/AppTextarea';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { formatPrice } from '@/lib/format';
import type { ExtraServiceDto } from '@/types/extra-service';
import type { LocationShortDto } from '@/types/location';

type FormState = {
  name: string;
  description: string;
  price: string;
  locationId: string;
};

const emptyForm = (): FormState => ({
  name: '',
  description: '',
  price: '0',
  locationId: '',
});

export default function AdminExtraServicesPage() {
  const [items, setItems] = useState<ExtraServiceDto[]>([]);
  const [locations, setLocations] = useState<LocationShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const locationOptions = useMemo(() => {
    const roots = locations.filter((l) => !l.parentId);
    const options: { value: string; label: string }[] = [];
    for (const root of roots) {
      options.push({ value: root.id, label: root.name });
      for (const child of locations.filter((l) => l.parentId === root.id)) {
        options.push({
          value: child.id,
          label: `${root.name} → ${child.name}`,
        });
      }
    }
    // orphan sublocations without loaded parent
    for (const loc of locations) {
      if (
        loc.parentId &&
        !options.some((opt) => opt.value === loc.id)
      ) {
        options.push({ value: loc.id, label: loc.name });
      }
    }
    return options;
  }, [locations]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [extras, locs] = await Promise.all([
        extraServicesApi.list({ limit: 100 }),
        locationsApi.list({ limit: 100 }),
      ]);
      setItems(extras);
      setLocations(locs);
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
    setForm(emptyForm());
  }

  function startEdit(item: ExtraServiceDto) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      locationId: item.locationId ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      locationId: form.locationId || null,
    };
    try {
      if (editingId) {
        await extraServicesApi.update(editingId, payload);
      } else {
        await extraServicesApi.create(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Дополнительные услуги</h1>
      <form
        onSubmit={onSubmit}
        className="mb-8 space-y-3 rounded-card border border-border bg-surface p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">
            {editingId ? 'Редактирование' : 'Новая услуга'}
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
        <AppInput
          label="Цена"
          type="number"
          min={0}
          value={form.price}
          onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          required
        />
        <AppSelect
          label="Привязка к точке"
          value={form.locationId}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, locationId: e.target.value }))
          }
          options={locationOptions}
          placeholder="Без привязки — доступна везде"
        />
        <p className="text-xs text-text-secondary">
          Можно связать с локацией, подлокацией или оставить без привязки
          (глобальная услуга).
        </p>
        <AppButton type="submit" loading={busy}>
          {editingId ? 'Сохранить' : 'Создать'}
        </AppButton>
      </form>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-text-secondary">
                  {formatPrice(item.price)}
                  {' · '}
                  {item.locationName
                    ? `точка: ${item.locationName}`
                    : 'без привязки'}
                </p>
              </div>
              <div className="flex gap-2">
                <AppButton
                  size="sm"
                  variant="secondary"
                  onClick={() => startEdit(item)}
                >
                  Изменить
                </AppButton>
                <AppButton
                  size="sm"
                  variant="danger"
                  onClick={() => setDeleteId(item.id)}
                >
                  Удалить
                </AppButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Удалить услугу?"
        message="Действие выполнит soft-delete."
        loading={busy}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          setBusy(true);
          try {
            await extraServicesApi.remove(deleteId);
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
