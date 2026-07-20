'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { tripsApi } from '@/api/trips.api';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { RequireAuth } from '@/lib/require-auth';
import { formatDate, formatPrice } from '@/lib/format';
import type { TripShortDto } from '@/types/trip';

function TripsContent() {
  const [items, setItems] = useState<TripShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await tripsApi.list({ limit: 50 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SectionHeader
        title="Мои поездки"
        action={
          <Link href="/tours" className="text-sm text-primary underline">
            Выбрать тур
          </Link>
        }
      />
      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Поездок пока нет"
          message="Создайте поездку из готового тура."
          actionLabel="К турам"
          onAction={() => {
            window.location.href = '/tours';
          }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="block rounded-card border border-border bg-surface p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{trip.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                  </p>
                </div>
                <StatusBadge status={trip.status} />
              </div>
              <p className="mt-3 font-semibold text-primary">
                {formatPrice(trip.estimatedPrice)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  return (
    <RequireAuth>
      <TripsContent />
    </RequireAuth>
  );
}
