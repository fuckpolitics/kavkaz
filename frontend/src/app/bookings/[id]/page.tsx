'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { bookingsApi } from '@/api/bookings.api';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { RequireAuth } from '@/lib/require-auth';
import { formatDate, formatPrice } from '@/lib/format';
import type { BookingDto } from '@/types/booking';

function BookingDetailContent() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setBooking(await bookingsApi.get(params.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!booking) return <EmptyState title="Бронирование не найдено" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{booking.tripTitle}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Создано: {formatDate(booking.createdAt)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="rounded-card border border-border bg-surface p-5 shadow-card">
        <p className="text-sm text-text-secondary">Итоговая цена</p>
        <p className="text-3xl font-bold text-primary">
          {formatPrice(booking.totalPrice)}
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Взрослые: {booking.adults}, дети: {booking.children}
        </p>
        {booking.comment ? (
          <p className="mt-4 text-sm">
            <span className="font-medium">Комментарий:</span> {booking.comment}
          </p>
        ) : null}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Снимок программы</h2>
        <div className="space-y-3">
          {booking.days.map((day) => (
            <article
              key={day.id}
              className="rounded-card border border-border bg-surface p-4"
            >
              <h3 className="font-semibold">
                День {day.dayNumber}: {day.title}
                {day.isRest || day.locations.length === 0 ? (
                  <span className="ml-2 rounded-full bg-accent/50 px-2 py-0.5 text-xs font-medium text-forest">
                    Отдых
                  </span>
                ) : null}
              </h3>
              {day.locations.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                  {day.locations.map((loc) => (
                    <li key={loc.id}>• {loc.locationName}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-text-secondary">
                  День без экскурсий
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      {booking.extraServices.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Услуги</h2>
          <ul className="space-y-2">
            {booking.extraServices.map((s) => (
              <li
                key={s.id}
                className="flex justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              >
                <span>
                  {s.serviceName} × {s.quantity}
                </span>
                <span className="font-medium">{formatPrice(s.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <RequireAuth>
      <BookingDetailContent />
    </RequireAuth>
  );
}
