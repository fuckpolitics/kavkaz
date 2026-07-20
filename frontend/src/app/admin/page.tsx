'use client';

import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Администрирование</h1>
      <p className="mb-6 text-text-secondary">
        Управление каталогом, бронированиями и пользователями.
      </p>
      <div className="grid gap-3 tablet:grid-cols-2">
        {[
          ['/admin/destinations', 'Направления'],
          ['/admin/locations', 'Локации'],
          ['/admin/extra-services', 'Доп. услуги'],
          ['/admin/tours', 'Туры'],
          ['/admin/bookings', 'Бронирования'],
          ['/admin/users', 'Пользователи'],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-card border border-border bg-surface p-5 shadow-soft transition hover:shadow-card"
          >
            <p className="font-semibold">{label}</p>
            <p className="mt-1 text-sm text-text-secondary">Открыть раздел</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
