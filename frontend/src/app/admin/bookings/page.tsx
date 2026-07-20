'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin.api';
import { bookingsApi } from '@/api/bookings.api';
import { ApiError } from '@/api/client';
import { AppSelect } from '@/components/AppSelect';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatPrice } from '@/lib/format';
import type { AdminBookingDto } from '@/types/booking';
import type { BookingStatus } from '@/types/common';

const STATUSES: { value: BookingStatus; label: string }[] = [
  { value: 'PENDING', label: 'Ожидает' },
  { value: 'CONFIRMED', label: 'Подтверждён' },
  { value: 'PAID', label: 'Оплачен' },
  { value: 'CANCELLED', label: 'Отменён' },
  { value: 'COMPLETED', label: 'Завершён' },
];

function customerName(item: AdminBookingDto): string {
  return [item.customer.firstName, item.customer.lastName]
    .filter(Boolean)
    .join(' ');
}

function tripDates(item: AdminBookingDto): string {
  if (item.startDate && item.endDate) {
    return `${formatDate(item.startDate)} — ${formatDate(item.endDate)}`;
  }
  if (item.startDate) {
    return `с ${formatDate(item.startDate)}`;
  }
  return 'Даты не указаны';
}

export default function AdminBookingsPage() {
  const [items, setItems] = useState<AdminBookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminApi.listBookings({ limit: 100 }));
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
    <div>
      <h1 className="mb-6 text-3xl font-bold">Бронирования</h1>
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-card border border-border bg-surface p-5 shadow-soft"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold">{item.tripTitle}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Создано {formatDate(item.createdAt)} · {tripDates(item)}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={item.status} />
                  <p className="mt-2 text-lg font-bold text-primary">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 border-t border-border pt-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Клиент
                  </p>
                  <p className="mt-1 font-medium">{customerName(item)}</p>
                  <ul className="mt-1 space-y-0.5 text-sm text-text-secondary">
                    {item.customer.phone ? <li>{item.customer.phone}</li> : null}
                    {item.customer.email ? <li>{item.customer.email}</li> : null}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Участники
                  </p>
                  <p className="mt-1 text-sm">
                    Взрослые: {item.adults}
                    {item.children > 0 ? ` · Дети: ${item.children}` : ''}
                  </p>
                  {item.comment ? (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Комментарий:</span>{' '}
                      {item.comment}
                    </p>
                  ) : null}
                </div>
              </div>

              {item.days.length > 0 ? (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Программа
                  </p>
                  <div className="space-y-2">
                    {item.days.map((day) => (
                      <div key={day.id} className="text-sm">
                        <p className="font-medium">
                          День {day.dayNumber}: {day.title}
                          {day.isRest || day.locations.length === 0 ? (
                            <span className="ml-2 rounded-full bg-accent/40 px-2 py-0.5 text-[11px] font-medium text-forest">
                              Отдых
                            </span>
                          ) : null}
                        </p>
                        {day.locations.length > 0 ? (
                          <p className="mt-0.5 text-text-secondary">
                            {day.locations.map((l) => l.locationName).join(' → ')}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-text-secondary">
                            Без экскурсий
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {item.extraServices.length > 0 ? (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Доп. услуги
                  </p>
                  <ul className="space-y-1 text-sm">
                    {item.extraServices.map((s) => (
                      <li key={s.id} className="flex justify-between gap-3">
                        <span>
                          {s.serviceName}
                          {s.quantity > 1 ? ` × ${s.quantity}` : ''}
                        </span>
                        <span className="shrink-0 font-medium">
                          {formatPrice(s.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-4 border-t border-border pt-4">
                <AppSelect
                  label="Статус"
                  value={item.status}
                  options={STATUSES}
                  onChange={async (e) => {
                    try {
                      await bookingsApi.updateStatus(item.id, {
                        status: e.target.value as BookingStatus,
                      });
                      await load();
                    } catch (err) {
                      setError(err instanceof ApiError ? err.message : 'Ошибка');
                    }
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
