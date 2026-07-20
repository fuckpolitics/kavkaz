import Link from 'next/link';
import type { BookingShortDto } from '@/types/booking';
import { formatDate, formatPrice } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

export function BookingCard({ booking }: { booking: BookingShortDto }) {
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="block rounded-card border border-border bg-surface p-4 shadow-soft transition hover:shadow-card"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">{booking.tripTitle}</h3>
        <StatusBadge status={booking.status} />
      </div>
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <span>{formatDate(booking.createdAt)}</span>
        <span className="font-semibold text-primary">
          {formatPrice(booking.totalPrice)}
        </span>
      </div>
    </Link>
  );
}
