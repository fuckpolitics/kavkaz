'use client';

import { FormEvent, useEffect, useState } from 'react';
import { destinationsApi } from '@/api/destinations.api';
import { ApiError } from '@/api/client';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppTextarea } from '@/components/AppTextarea';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import type { DestinationShortDto } from '@/types/destination';

export default function AdminDestinationsPage() {
  const [items, setItems] = useState<DestinationShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await destinationsApi.list({ limit: 100 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await destinationsApi.create({ name, slug, description });
      setName('');
      setSlug('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка создания');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Направления</h1>
      <form
        onSubmit={onCreate}
        className="mb-8 space-y-3 rounded-card border border-border bg-surface p-4"
      >
        <AppInput label="Название" value={name} onChange={(e) => setName(e.target.value)} required />
        <AppInput label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <AppTextarea
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <AppButton type="submit" loading={busy}>
          Создать
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
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-text-secondary">{item.slug}</p>
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
        title="Удалить направление?"
        message="Действие выполнит soft-delete."
        loading={busy}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          setBusy(true);
          try {
            await destinationsApi.remove(deleteId);
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
