'use client';

import { FormEvent, useEffect, useState } from 'react';
import { destinationsApi } from '@/api/destinations.api';
import { toursApi } from '@/api/tours.api';
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
import type { DestinationShortDto } from '@/types/destination';
import type { TourShortDto } from '@/types/tour';

export default function AdminToursPage() {
  const [items, setItems] = useState<TourShortDto[]>([]);
  const [destinations, setDestinations] = useState<DestinationShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [destinationId, setDestinationId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [durationDays, setDurationDays] = useState('3');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [tours, dests] = await Promise.all([
        toursApi.list({ limit: 100 }),
        destinationsApi.list({ limit: 100 }),
      ]);
      setItems(tours);
      setDestinations(dests);
      if (!destinationId && dests[0]) setDestinationId(dests[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await toursApi.create({
        destinationId,
        title,
        description,
        price: Number(price),
        durationDays: Number(durationDays),
      });
      setTitle('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Туры</h1>
      <p className="mb-6 rounded-card border border-accent/50 bg-accent/20 p-3 text-sm text-text-secondary">
        TODO: API для управления TourDay / TourDayLocation / TourExtraService отсутствует.
        Сейчас доступны только скалярные поля тура (название, описание, цена, длительность,
        coverImage, destination).
      </p>

      <form onSubmit={onCreate} className="mb-8 space-y-3 rounded-card border border-border bg-surface p-4">
        <AppSelect
          label="Направление"
          value={destinationId}
          onChange={(e) => setDestinationId(e.target.value)}
          options={destinations.map((d) => ({ value: d.id, label: d.name }))}
        />
        <AppInput label="Название" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <AppTextarea
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <AppInput
            label="Цена"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <AppInput
            label="Дней"
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            required
          />
        </div>
        <AppButton type="submit" loading={busy}>
          Создать тур
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
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-text-secondary">
                  {item.destination.name} · {item.durationDays} дн. ·{' '}
                  {formatPrice(item.price)}
                </p>
              </div>
              <AppButton size="sm" variant="danger" onClick={() => setDeleteId(item.id)}>
                Удалить
              </AppButton>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Удалить тур?"
        message="Действие выполнит soft-delete."
        loading={busy}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          setBusy(true);
          try {
            await toursApi.remove(deleteId);
            setDeleteId(null);
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
