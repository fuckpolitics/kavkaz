'use client';

import { useEffect, useState } from 'react';
import { bookingsApi } from '@/api/bookings.api';
import { BookingCard } from '@/components/BookingCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { SectionHeader } from '@/components/SectionHeader';
import { RequireAuth } from '@/lib/require-auth';
import type { BookingShortDto } from '@/types/booking';

function BookingsContent() {
  const [items, setItems] = useState<BookingShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await bookingsApi.list({ limit: 50 }));
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
      <SectionHeader title="Мои бронирования" />
      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState title="Бронирований пока нет" />
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <RequireAuth>
      <BookingsContent />
    </RequireAuth>
  );
}
